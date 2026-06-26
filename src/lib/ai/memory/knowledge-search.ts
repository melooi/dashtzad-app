import "server-only";
import { prisma } from "@/lib/prisma";
import { createEmbeddings } from "@/lib/ai/openai-client";

/** Cosine similarity between two equal-length vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Search GUIDE knowledge chunks most relevant to the query. Returns top-K content strings. */
export async function searchKnowledge(query: string, topK = 5): Promise<string[]> {
  try {
    // 1. Get query embedding
    const embResult = await createEmbeddings([query]);
    const queryEmbedding = embResult.embeddings[0];
    if (!queryEmbedding?.length) return [];

    // 2. Load all AiVectorChunk records for GUIDE documents
    const chunks = await prisma.aiVectorChunk.findMany({
      where: {
        document: {
          sourceType: "GUIDE",
        },
      },
      select: {
        id: true,
        content: true,
        embedding: true,
        document: {
          select: { title: true },
        },
      },
    });

    if (!chunks.length) return [];

    // 3. Compute cosine similarity for each chunk
    const scored = chunks
      .filter((c) => c.embedding.length > 0)
      .map((c) => ({
        content: c.content,
        title: c.document.title,
        score: cosineSimilarity(queryEmbedding, c.embedding),
      }));

    // 4. Sort desc, take topK where similarity > 0.6
    const top = scored
      .filter((c) => c.score > 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // 5. Return content strings prefixed with document title
    return top.map((c) => `[${c.title}] ${c.content}`);
  } catch {
    return [];
  }
}

export function formatKnowledgeForPrompt(chunks: string[]): string {
  if (!chunks.length) return "";
  return "# پایگاه دانش\n" + chunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n");
}
