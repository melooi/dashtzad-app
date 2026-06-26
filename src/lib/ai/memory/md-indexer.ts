import "server-only";
import { prisma } from "@/lib/prisma";
import { createEmbeddings } from "@/lib/ai/openai-client";
import crypto from "node:crypto";

export interface IndexResult {
  sourceId: string;
  chunkCount: number;
  title: string;
}

/** Parse MD content into sections. Split by ## headings first, then by paragraph if section > 800 chars. */
function parseSections(content: string): { heading: string; text: string }[] {
  const sections: { heading: string; text: string }[] = [];

  // Split by ## headings
  const rawSections = content.split(/^#{1,2}\s+/m).filter((s) => s.trim());

  for (const raw of rawSections) {
    const lines = raw.split("\n");
    const heading = lines[0]?.trim() ?? "";
    const text = lines.slice(1).join("\n").trim();

    if (!text) {
      if (heading) sections.push({ heading, text: heading });
      continue;
    }

    const fullText = heading ? `${heading}\n${text}` : text;

    if (fullText.length <= 800) {
      sections.push({ heading, text: fullText });
    } else {
      // Split long sections by paragraph
      const paragraphs = fullText.split(/\n\n+/).filter((p) => p.trim());
      let chunk = "";
      for (const para of paragraphs) {
        if (chunk.length + para.length + 2 > 800 && chunk) {
          sections.push({ heading, text: chunk.trim() });
          chunk = para;
        } else {
          chunk = chunk ? `${chunk}\n\n${para}` : para;
        }
      }
      if (chunk.trim()) {
        sections.push({ heading, text: chunk.trim() });
      }
    }
  }

  // If no headings found, treat whole content as single section
  if (!sections.length && content.trim()) {
    if (content.length <= 800) {
      sections.push({ heading: "", text: content.trim() });
    } else {
      const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
      let chunk = "";
      for (const para of paragraphs) {
        if (chunk.length + para.length + 2 > 800 && chunk) {
          sections.push({ heading: "", text: chunk.trim() });
          chunk = para;
        } else {
          chunk = chunk ? `${chunk}\n\n${para}` : para;
        }
      }
      if (chunk.trim()) sections.push({ heading: "", text: chunk.trim() });
    }
  }

  return sections;
}

/** Index an MD file into AiKnowledgeSource + AiVectorDocument + AiVectorChunk.
 *  If a source with the same title already exists, reindex it (delete old chunks, create new). */
export async function indexMdFile(opts: {
  title: string;
  content: string;
  url?: string;
}): Promise<IndexResult> {
  // 1. Hash content
  const contentHash = crypto.createHash("md5").update(opts.content).digest("hex");

  // 2. Find existing source by title
  const existingSource = await prisma.aiKnowledgeSource.findFirst({
    where: { type: "GUIDE", title: opts.title },
    include: { documents: { select: { id: true, contentHash: true } } },
  });

  // Check if already indexed with same hash
  if (existingSource) {
    const existingDoc = existingSource.documents[0];
    if (existingDoc?.contentHash === contentHash) {
      return { sourceId: existingSource.id, chunkCount: 0, title: opts.title };
    }

    // 3. Different hash: delete existing documents (cascade deletes chunks)
    for (const doc of existingSource.documents) {
      await prisma.aiVectorDocument.delete({ where: { id: doc.id } });
    }
  }

  // Create or reuse source
  let source = existingSource;
  if (!source) {
    source = await prisma.aiKnowledgeSource.create({
      data: {
        type: "GUIDE",
        title: opts.title,
        url: opts.url,
        externalId: contentHash,
        status: "ACTIVE",
      },
      include: { documents: { select: { id: true, contentHash: true } } },
    });
  }

  // 4. Create AiVectorDocument
  const doc = await prisma.aiVectorDocument.create({
    data: {
      sourceId: source.id,
      sourceType: "GUIDE",
      title: opts.title,
      url: opts.url,
      contentHash,
    },
  });

  // 5. Parse sections
  const sections = parseSections(opts.content);
  let chunkCount = 0;

  // 6. Batch embed sections (up to 10 at a time)
  const BATCH_SIZE = 10;
  for (let batchStart = 0; batchStart < sections.length; batchStart += BATCH_SIZE) {
    const batch = sections.slice(batchStart, batchStart + BATCH_SIZE);
    const texts = batch.map((s) => s.text);

    const embResult = await createEmbeddings(texts, { model: "text-embedding-3-small", dimensions: 1536 });

    const chunkData = batch.map((section, i) => ({
      documentId: doc.id,
      chunkIndex: batchStart + i,
      content: section.text,
      embedding: embResult.embeddings[i] ?? [],
      embeddingModel: "text-embedding-3-small",
      dim: 1536,
    }));

    await prisma.aiVectorChunk.createMany({ data: chunkData });
    chunkCount += batch.length;
  }

  // 7. Update AiKnowledgeSource
  await prisma.aiKnowledgeSource.update({
    where: { id: source.id },
    data: {
      documentCount: 1,
      lastIndexedAt: new Date(),
      status: "ACTIVE",
      externalId: contentHash,
    },
  });

  return { sourceId: source.id, chunkCount, title: opts.title };
}

/** Delete an indexed source and all its documents/chunks (cascade). */
export async function deleteMdSource(sourceId: string): Promise<void> {
  await prisma.aiKnowledgeSource.delete({ where: { id: sourceId } });
}
