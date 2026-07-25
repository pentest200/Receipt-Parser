import prisma from "../db/prisma.js";
import { SaveReceiptInput } from "../utils/validation.js";

/**
 * Save a receipt with its line items to the database.
 */
export async function saveReceipt(data: SaveReceiptInput) {
  const receipt = await prisma.receipt.create({
    data: {
      merchant: data.merchant ?? null,
      date: data.date ?? null,
      currency: data.currency ?? null,
      subtotal: data.subtotal ?? null,
      tax: data.tax ?? null,
      tip: data.tip ?? null,
      discount: data.discount ?? null,
      total: data.total ?? null,
      lineItems: {
        create: data.lineItems.map((item) => ({
          name: item.name,
          amount: item.amount,
        })),
      },
    },
    include: { lineItems: true },
  });

  return receipt;
}

/**
 * Get all receipts ordered by newest first.
 */
export async function getAllReceipts() {
  return prisma.receipt.findMany({
    orderBy: { createdAt: "desc" },
    include: { lineItems: true },
  });
}

/**
 * Get a single receipt by ID with its line items.
 */
export async function getReceiptById(id: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { lineItems: true },
  });

  if (!receipt) {
    throw new Error("Receipt not found");
  }

  return receipt;
}
