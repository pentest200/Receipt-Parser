import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the provider module
vi.mock("../llm/provider", () => ({
  extractReceiptData: vi.fn(),
}));

import { parseReceipt } from "../services/parseService";
import { extractReceiptData } from "../llm/provider";

const mockExtract = vi.mocked(extractReceiptData);

const validResponse = JSON.stringify({
  merchant: "Starbucks",
  date: "2024-01-15",
  currency: "USD",
  subtotal: 12.5,
  tax: 1.0,
  tip: 2.0,
  discount: 0,
  total: 15.5,
  lineItems: [{ name: "Latte", amount: 5.5 }],
  confidence: {
    merchant: 0.95,
    date: 0.8,
    total: 0.99,
    lineItems: 0.82,
  },
});

describe("parseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully parses valid LLM response", async () => {
    mockExtract.mockResolvedValueOnce(validResponse);

    const result = await parseReceipt(Buffer.from("fake-image"), "image/jpeg");
    expect(result.merchant).toBe("Starbucks");
    expect(result.total).toBe(15.5);
    expect(result.lineItems).toHaveLength(1);
    expect(mockExtract).toHaveBeenCalledTimes(1);
  });

  it("handles markdown-wrapped JSON", async () => {
    const wrapped = "```json\n" + validResponse + "\n```";
    mockExtract.mockResolvedValueOnce(wrapped);

    const result = await parseReceipt(Buffer.from("fake-image"), "image/jpeg");
    expect(result.merchant).toBe("Starbucks");
  });

  it("retries on first failure then succeeds", async () => {
    mockExtract
      .mockRejectedValueOnce(new Error("API timeout"))
      .mockResolvedValueOnce(validResponse);

    const result = await parseReceipt(Buffer.from("fake-image"), "image/jpeg");
    expect(result.merchant).toBe("Starbucks");
    expect(mockExtract).toHaveBeenCalledTimes(2);
  });

  it("throws after two failures", async () => {
    mockExtract
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"));

    await expect(
      parseReceipt(Buffer.from("fake-image"), "image/jpeg")
    ).rejects.toThrow("Fail 2");
    expect(mockExtract).toHaveBeenCalledTimes(2);
  });

  it("retries on invalid JSON", async () => {
    mockExtract
      .mockResolvedValueOnce("not valid json at all")
      .mockResolvedValueOnce(validResponse);

    const result = await parseReceipt(Buffer.from("fake-image"), "image/jpeg");
    expect(result.merchant).toBe("Starbucks");
    expect(mockExtract).toHaveBeenCalledTimes(2);
  });

  it("retries on Zod validation failure", async () => {
    const invalidStructure = JSON.stringify({
      merchant: 123, // wrong type
      lineItems: "not-an-array",
    });
    mockExtract
      .mockResolvedValueOnce(invalidStructure)
      .mockResolvedValueOnce(validResponse);

    const result = await parseReceipt(Buffer.from("fake-image"), "image/jpeg");
    expect(result.merchant).toBe("Starbucks");
    expect(mockExtract).toHaveBeenCalledTimes(2);
  });
});
