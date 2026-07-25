import { Request, Response } from "express";
import { parseReceipt } from "../services/parseService.js";
import {
  saveReceipt,
  getAllReceipts,
  getReceiptById,
} from "../services/receiptService.js";
import { saveReceiptSchema } from "../utils/validation.js";
import { ZodError } from "zod";

/**
 * POST /api/parse
 * Accepts a receipt image, sends to LLM, returns structured data.
 */
export async function handleParse(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file uploaded" });
      return;
    }

    const result = await parseReceipt(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (error) {
    console.error("Parse error:", error);

    if (error instanceof ZodError) {
      res.status(422).json({
        error: "Failed to extract valid receipt data",
        details: error.errors,
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : "Failed to parse receipt";
    res.status(500).json({ error: message });
  }
}

/**
 * POST /api/receipts
 * Save a corrected receipt to the database.
 */
export async function handleSaveReceipt(req: Request, res: Response) {
  try {
    const data = saveReceiptSchema.parse(req.body);
    const receipt = await saveReceipt(data);
    res.status(201).json(receipt);
  } catch (error) {
    console.error("Save error:", error);

    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Invalid receipt data",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: "Failed to save receipt" });
  }
}

/**
 * GET /api/receipts
 * List all saved receipts, newest first.
 */
export async function handleGetReceipts(_req: Request, res: Response) {
  try {
    const receipts = await getAllReceipts();
    res.json(receipts);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
}

/**
 * GET /api/receipts/:id
 * Get a single receipt with line items.
 */
export async function handleGetReceiptById(req: Request, res: Response) {
  try {
    const receipt = await getReceiptById(req.params.id);
    res.json(receipt);
  } catch (error) {
    console.error("Fetch error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Receipt not found") {
      res.status(404).json({ error: message });
      return;
    }

    res.status(500).json({ error: "Failed to fetch receipt" });
  }
}
