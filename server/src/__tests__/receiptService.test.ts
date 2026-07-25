import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../db/prisma";
import { saveReceipt, getAllReceipts, getReceiptById } from "../services/receiptService";

describe("receiptService", () => {
  beforeAll(async () => {
    // Clear any existing receipts in the dev database before testing
    await prisma.lineItem.deleteMany({});
    await prisma.receipt.deleteMany({});
  });

  afterAll(async () => {
    await prisma.lineItem.deleteMany({});
    await prisma.receipt.deleteMany({});
    await prisma.$disconnect();
  });

  it("can save a receipt and retrieve it", async () => {
    const input = {
      merchant: "Walmart",
      date: "2024-03-01",
      currency: "USD",
      subtotal: 50.0,
      tax: 4.5,
      tip: 0.0,
      discount: 2.0,
      total: 52.5,
      lineItems: [
        { name: "Socks", amount: 15.0 },
        { name: "T-Shirt", amount: 35.0 },
      ],
    };

    const saved = await saveReceipt(input);
    expect(saved.id).toBeDefined();
    expect(saved.merchant).toBe("Walmart");
    expect(saved.lineItems).toHaveLength(2);
    expect(saved.lineItems[0].name).toBe("Socks");
    expect(saved.lineItems[1].amount).toBe(35.0);

    const retrieved = await getReceiptById(saved.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.merchant).toBe("Walmart");
    expect(retrieved?.lineItems).toHaveLength(2);
  });

  it("can list all saved receipts in descending order", async () => {
    const input1 = {
      merchant: "Store A",
      total: 10.0,
      lineItems: [],
    };
    const input2 = {
      merchant: "Store B",
      total: 20.0,
      lineItems: [],
    };

    await saveReceipt(input1);
    // Wait a brief moment to ensure separate timestamps
    await new Promise((resolve) => setTimeout(resolve, 50));
    await saveReceipt(input2);

    const list = await getAllReceipts();
    expect(list.length).toBeGreaterThanOrEqual(2);
    // Newest first
    expect(list[0].merchant).toBe("Store B");
    expect(list[1].merchant).toBe("Store A");
  });

  it("throws an error when receipt is not found", async () => {
    await expect(getReceiptById("non-existent-uuid")).rejects.toThrow("Receipt not found");
  });
});
