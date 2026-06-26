import "server-only";
import { prisma } from "@/lib/prisma";
import { createResponse } from "@/lib/ai/openai-client";

const HIT_THRESHOLD = 8;

export async function getFrequentTopicsContext(): Promise<string> {
  try {
    const topics = await prisma.aiFrequentTopic.findMany({
      where: {
        hitCount: { gte: HIT_THRESHOLD },
        answer: { not: null },
        NOT: { answer: "" },
      },
      orderBy: { hitCount: "desc" },
      take: 8,
    });

    if (!topics.length) return "";

    return (
      "# سوالات رایج\n" +
      topics
        .map((t) => `موضوع: ${t.topic}\nپاسخ: ${t.answer}`)
        .join("\n\n")
    );
  } catch {
    return "";
  }
}

export async function trackConversationTopic(userMessage: string): Promise<void> {
  try {
    const result = await createResponse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: `از پیام کاربر زیر، موضوع اصلی را استخراج کن.\nخروجی فقط JSON: {"slug": "kebab-case-english-max-30-chars", "topic": "فارسی حداکثر ۲۰ کاراکتر"}\n\nپیام: ${userMessage.slice(0, 500)}`,
        },
      ],
      maxOutputTokens: 100,
    });

    const rawText = (result.outputText ?? "").replace(/```json|```/g, "").trim();
    let slug = "";
    let topic = "";
    try {
      const parsed = JSON.parse(rawText) as { slug?: string; topic?: string };
      slug = (parsed.slug ?? "").trim().slice(0, 30);
      topic = (parsed.topic ?? "").trim().slice(0, 20);
    } catch {
      return;
    }

    if (!slug) return;

    // Upsert topic
    const existing = await prisma.aiFrequentTopic.findUnique({ where: { slug } });

    if (existing) {
      const updated = await prisma.aiFrequentTopic.update({
        where: { slug },
        data: { hitCount: { increment: 1 } },
      });

      // If hitCount just reached threshold and answer is empty, generate cached answer
      if (updated.hitCount === HIT_THRESHOLD && (!updated.answer || updated.answer === "")) {
        await generateTopicAnswer(slug, topic);
      }
    } else {
      await prisma.aiFrequentTopic.create({
        data: { slug, topic, hitCount: 1, answer: "" },
      });
    }
  } catch {
    // Background operation — never throw
  }
}

async function generateTopicAnswer(slug: string, topic: string): Promise<void> {
  try {
    const result = await createResponse({
      model: "gpt-4o-mini",
      instructions:
        "تو دستیار پشتیبانی فروشگاه دشت‌زاد هستی. پاسخ کوتاه و مفید به فارسی بده.",
      input: [{ role: "user", content: `پاسخ مناسب به سوال/موضوع «${topic}» چیست؟` }],
      maxOutputTokens: 300,
    });

    const answer = (result.outputText ?? "").trim();
    if (!answer) return;

    await prisma.aiFrequentTopic.update({
      where: { slug },
      data: { answer },
    });
  } catch {
    // Never throw
  }
}

export async function regenerateTopicAnswer(slug: string, siteContext: string): Promise<void> {
  try {
    const topic = await prisma.aiFrequentTopic.findUnique({ where: { slug } });
    if (!topic) return;

    const result = await createResponse({
      model: "gpt-4o-mini",
      instructions: siteContext
        ? `تو دستیار پشتیبانی فروشگاه دشت‌زاد هستی.\n\n${siteContext}`
        : "تو دستیار پشتیبانی فروشگاه دشت‌زاد هستی.",
      input: [{ role: "user", content: `پاسخ مناسب به سوال/موضوع «${topic.topic}» چیست؟` }],
      maxOutputTokens: 400,
    });

    const answer = (result.outputText ?? "").trim();
    if (!answer) return;

    await prisma.aiFrequentTopic.update({
      where: { slug },
      data: { answer },
    });
  } catch {
    // Never throw
  }
}
