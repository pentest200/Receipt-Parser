import { extractReceiptData } from "../llm/provider.js";
import { parsedReceiptSchema, ParsedReceipt } from "../utils/validation.js";

/**
 * Orchestrates receipt parsing: sends image to LLM, validates response with Zod.
 * Implements single retry on failure.
 */
export async function parseReceipt(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ParsedReceipt> {
  let lastError: Error | null = null;

  // Attempt extraction with one retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const rawJson = await extractReceiptData(imageBuffer, mimeType);
      const parsed = cleanAndParse(rawJson);
      const validated = parsedReceiptSchema.parse(parsed);
      return validated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Parse attempt ${attempt + 1} failed: ${lastError.message}`
      );
    }
  }

  throw lastError || new Error("Failed to parse receipt after retries");
}

/**
 * Cleans raw LLM output and parses as JSON.
 * Handles cases where the model wraps JSON in markdown code fences.
 */
function cleanAndParse(raw: string): unknown {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from LLM: ${cleaned.substring(0, 200)}`);
  }
}
