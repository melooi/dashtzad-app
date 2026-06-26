/**
 * Structured Outputs helper for the Responses API.
 *
 * OpenAI Structured Outputs require a JSON Schema with `strict: true`, every
 * property listed in `required`, and `additionalProperties: false`. This module
 * builds that `text.format` object, runs the call through the central client,
 * and parses/validates the JSON result — so intent detection, ticket
 * classification, product suggestions and admin findings get type-safe objects
 * instead of free text.
 */

import { z } from "zod";
import { createResponse } from "@/lib/ai/openai-client";
import { AiError } from "@/lib/ai/errors";
import { logUsage } from "@/lib/ai/usage-logger";
import type { AiResponseRequest, AiTextFormat } from "@/lib/ai/types";

/** Build the `text.format` value for a Structured Outputs request. */
export function buildJsonSchemaFormat(
  name: string,
  schema: Record<string, unknown>,
): AiTextFormat["format"] {
  return { type: "json_schema", name, schema, strict: true };
}

export interface StructuredRequest<T> extends Omit<AiResponseRequest, "textFormat"> {
  /** Stable schema name (a-z, 0-9, underscores). */
  schemaName: string;
  /** JSON Schema (strict-compatible). */
  jsonSchema: Record<string, unknown>;
  /** Optional Zod schema for a second validation pass on the parsed object. */
  zodSchema?: z.ZodType<T>;
}

export interface StructuredResult<T> {
  data: T;
  responseId: string;
  raw: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
}

/**
 * Run a Structured Outputs call and return the parsed (and optionally
 * Zod-validated) object. Throws `AiError("parse_error")` if the model output
 * can't be parsed/validated. Logs a `STRUCTURED` usage row.
 */
export async function createStructured<T = unknown>(
  req: StructuredRequest<T>,
): Promise<StructuredResult<T>> {
  const { schemaName, jsonSchema, zodSchema, ...rest } = req;
  const result = await createResponse({
    ...rest,
    textFormat: buildJsonSchemaFormat(schemaName, jsonSchema),
  });

  await logUsage({
    conversationId: req.conversationId ?? null,
    messageId: req.messageId ?? null,
    operation: "STRUCTURED",
    model: result.model,
    tokensInput: result.usage.inputTokens,
    tokensOutput: result.usage.outputTokens,
    latencyMs: result.latencyMs,
    requestId: result.requestId,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.outputText);
  } catch (err) {
    throw new AiError("parse_error", "Structured output was not valid JSON.", {
      requestId: result.requestId,
      details: { raw: result.outputText.slice(0, 500) },
      cause: err,
    });
  }

  if (zodSchema) {
    const check = zodSchema.safeParse(parsed);
    if (!check.success) {
      throw new AiError("parse_error", "Structured output failed schema validation.", {
        requestId: result.requestId,
        details: { issues: check.error.issues.slice(0, 10) },
      });
    }
    parsed = check.data;
  }

  return {
    data: parsed as T,
    responseId: result.id,
    raw: result.outputText,
    usage: result.usage,
  };
}

/**
 * Convert a Zod schema into a strict JSON Schema usable with Structured
 * Outputs. Uses Zod 4's native `z.toJSONSchema` (which already emits
 * `additionalProperties: false` and lists every key in `required`), then
 * strips the `$schema` header OpenAI doesn't need. For schemas Zod can't
 * represent, pass an explicit `jsonSchema` instead.
 */
export function zodToStrictJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { unrepresentable: "any" }) as Record<string, unknown>;
  delete json.$schema;
  return json;
}
