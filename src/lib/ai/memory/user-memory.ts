import "server-only";
import { prisma } from "@/lib/prisma";
import { createResponse } from "@/lib/ai/openai-client";

export interface UserMemory {
  facts: string[];
  summary?: string;
}

export async function getUserMemory(opts: {
  customerId?: string | null;
  sessionId?: string | null;
}): Promise<UserMemory> {
  try {
    let row = null;

    if (opts.customerId) {
      row = await prisma.aiUserMemory.findUnique({
        where: { customerId: opts.customerId },
        select: { facts: true, summary: true },
      });
    } else if (opts.sessionId) {
      row = await prisma.aiUserMemory.findUnique({
        where: { sessionId: opts.sessionId },
        select: { facts: true, summary: true },
      });
    }

    if (!row) return { facts: [], summary: undefined };

    const facts = Array.isArray(row.facts) ? (row.facts as string[]) : [];
    return { facts, summary: row.summary ?? undefined };
  } catch {
    return { facts: [], summary: undefined };
  }
}

export async function updateUserMemory(opts: {
  customerId?: string | null;
  sessionId?: string | null;
  conversationMessages: { role: string; content: string }[];
}): Promise<void> {
  try {
    const { customerId, sessionId, conversationMessages } = opts;

    if (!conversationMessages.length) return;
    if (!customerId && !sessionId) return;

    // Get existing memory
    const existing = await getUserMemory({ customerId, sessionId });

    // Build conversation text (last 10 messages, max 2000 chars)
    const recentMessages = conversationMessages.slice(-10);
    let conversationText = recentMessages
      .map((m) => `${m.role === "user" ? "کاربر" : "دستیار"}: ${m.content}`)
      .join("\n");
    if (conversationText.length > 2000) {
      conversationText = conversationText.slice(-2000);
    }

    const existingFactsText =
      existing.facts.length > 0 ? `\nاطلاعات قبلی:\n${existing.facts.join("\n")}` : "";

    const prompt = `با توجه به مکالمه، اطلاعات مفید و پایدار درباره کاربر را استخراج کن (اسم، ترجیحات، علایق). خروجی فقط آرایه JSON از رشته‌ها، بدون توضیح.${existingFactsText}\n\nمکالمه:\n${conversationText}`;

    const result = await createResponse({
      model: "gpt-4o-mini",
      input: [{ role: "user", content: prompt }],
      maxOutputTokens: 500,
    });

    const rawText = (result.outputText ?? "").replace(/```json|```/g, "").trim();
    let newFacts: string[] = [];
    try {
      const parsed = JSON.parse(rawText) as unknown;
      if (Array.isArray(parsed)) {
        newFacts = parsed.filter((f): f is string => typeof f === "string");
      }
    } catch {
      return;
    }

    // Merge with existing facts (Set dedup), keep max 25
    const merged = Array.from(new Set([...existing.facts, ...newFacts])).slice(0, 25);
    const summary = merged.slice(0, 3).join("؛ ");

    // Upsert
    if (customerId) {
      await prisma.aiUserMemory.upsert({
        where: { customerId },
        create: { customerId, facts: merged, summary },
        update: { facts: merged, summary },
      });
    } else if (sessionId) {
      await prisma.aiUserMemory.upsert({
        where: { sessionId },
        create: { sessionId, facts: merged, summary },
        update: { facts: merged, summary },
      });
    }
  } catch {
    // Background operation — never throw
  }
}

export function formatUserMemoryForPrompt(mem: UserMemory): string {
  if (!mem.facts.length) return "";
  return "# آنچه از این کاربر می‌دانم\n" + mem.facts.map((f) => `- ${f}`).join("\n");
}
