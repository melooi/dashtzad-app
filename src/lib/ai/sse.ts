/**
 * Server-Sent Events helpers for the customer chat stream. The engine yields
 * typed `WireEvent`s; `sseResponse` turns an async iterable of them into a
 * Next.js streaming `Response`. The frontend (CP-D) consumes the same protocol.
 */

export type WireEvent =
  | { event: "meta"; data: { conversationId: string; userMessageId: string; aiAvailable: boolean } }
  | { event: "delta"; data: { text: string } }
  | { event: "tool"; data: { name: string; status: "running" | "done" | "denied" | "error"; summary?: string } }
  | { event: "card"; data: Record<string, unknown> }
  | { event: "triage"; data: { intent: string; priority: string; angry: boolean; needsHuman: boolean } }
  | {
      event: "done";
      data: {
        assistantMessageId: string | null;
        finishReason: "stop" | "blocked" | "ai_unavailable" | "error" | "handoff";
        aiUnavailable?: boolean;
        suggestHandoff?: boolean;
        usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
      };
    }
  | { event: "error"; data: { code: string; message: string } };

function encodeEvent(ev: WireEvent): string {
  return `event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`;
}

/** Build an SSE streaming Response from an async iterable of wire events. */
export function sseResponse(events: AsyncIterable<WireEvent>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const ev of events) {
          controller.enqueue(encoder.encode(encodeEvent(ev)));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "stream error";
        controller.enqueue(
          encoder.encode(encodeEvent({ event: "error", data: { code: "stream_error", message } })),
        );
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
