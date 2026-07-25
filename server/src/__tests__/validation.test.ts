import { describe, it, expect } from "vitest";
import { parsedReceiptSchema, saveReceiptSchema } from "../utils/validation";

describe("parsedReceiptSchema", () => {
  it("validates a complete receipt", () => {
    const valid = {
      merchant: "Starbucks",
      date: "2024-01-15",
      currency: "USD",
      subtotal: 12.5,
      tax: 1.0,
      tip: 2.0,
      discount: 0,
      total: 15.5,
      lineItems: [
        { name: "Latte", amount: 5.5 },
        { name: "Croissant", amount: 3.5 },
      ],
      confidence: {
        merchant: 0.95,
        date: 0.8,
        total: 0.99,
        lineItems: 0.82,
      },
    };

    const result = parsedReceiptSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("allows null values for optional fields", () => {
    const partial = {
      merchant: null,
      date: null,
      currency: null,
      subtotal: null,
      tax: null,
      tip: null,
      discount: null,
      total: null,
      lineItems: [],
    };

    const result = parsedReceiptSchema.safeParse(partial);
    expect(result.success).toBe(true);
  });

  it("rejects invalid line item structure", () => {
    const invalid = {
      merchant: "Test",
      date: "2024-01-01",
      currency: "USD",
      subtotal: 10,
      tax: 1,
      tip: 0,
      discount: 0,
      total: 11,
      lineItems: [{ name: "Item", amount: "not-a-number" }],
    };

    const result = parsedReceiptSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("applies default confidence scores when missing", () => {
    const noConfidence = {
      merchant: "Test",
      date: "2024-01-01",
      currency: "USD",
      subtotal: 10,
      tax: 1,
      tip: 0,
      discount: 0,
      total: 11,
      lineItems: [],
    };

    const result = parsedReceiptSchema.safeParse(noConfidence);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.confidence).toBeDefined();
      expect(result.data.confidence.merchant).toBe(0.5);
    }
  });

  it("rejects confidence scores outside 0-1 range", () => {
    const badConfidence = {
      merchant: "Test",
      date: "2024-01-01",
      currency: "USD",
      subtotal: 10,
      tax: 1,
      tip: 0,
      discount: 0,
      total: 11,
      lineItems: [],
      confidence: { merchant: 1.5 },
    };

    const result = parsedReceiptSchema.safeParse(badConfidence);
    expect(result.success).toBe(false);
  });
});

describe("saveReceiptSchema", () => {
  it("validates a save request", () => {
    const valid = {
      merchant: "Target",
      date: "2024-02-20",
      currency: "USD",
      subtotal: 25.0,
      tax: 2.0,
      total: 27.0,
      lineItems: [{ name: "Item A", amount: 25.0 }],
    };

    const result = saveReceiptSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects line items with empty names", () => {
    const invalid = {
      merchant: "Test",
      total: 10,
      lineItems: [{ name: "", amount: 10 }],
    };

    const result = saveReceiptSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects line items with non-numeric amounts", () => {
    const invalid = {
      merchant: "Test",
      total: 10,
      lineItems: [{ name: "Item", amount: "abc" }],
    };

    const result = saveReceiptSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("allows an empty receipt with no line items", () => {
    const minimal = {};
    const result = saveReceiptSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});
