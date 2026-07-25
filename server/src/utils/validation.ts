import { z } from "zod";

// Schema for individual line items from LLM
const lineItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

// Schema for confidence scores from LLM
const confidenceSchema = z.object({
  merchant: z.number().min(0).max(1).optional().default(0.5),
  date: z.number().min(0).max(1).optional().default(0.5),
  total: z.number().min(0).max(1).optional().default(0.5),
  lineItems: z.number().min(0).max(1).optional().default(0.5),
  subtotal: z.number().min(0).max(1).optional().default(0.5),
  tax: z.number().min(0).max(1).optional().default(0.5),
  tip: z.number().min(0).max(1).optional().default(0.5),
  discount: z.number().min(0).max(1).optional().default(0.5),
  currency: z.number().min(0).max(1).optional().default(0.5),
});

// Full schema for validating LLM parsed receipt response
export const parsedReceiptSchema = z.object({
  merchant: z.string().nullable(),
  date: z.string().nullable(),
  currency: z.string().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  tip: z.number().nullable(),
  discount: z.number().nullable(),
  total: z.number().nullable(),
  lineItems: z.array(lineItemSchema).default([]),
  confidence: confidenceSchema.optional().default({}),
});

export type ParsedReceipt = z.infer<typeof parsedReceiptSchema>;

// Schema for saving a receipt (from frontend)
export const saveReceiptSchema = z.object({
  merchant: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  tax: z.number().nullable().optional(),
  tip: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  lineItems: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      amount: z.number({ invalid_type_error: "Amount must be a number" }),
    })
  ).default([]),
});

export type SaveReceiptInput = z.infer<typeof saveReceiptSchema>;
