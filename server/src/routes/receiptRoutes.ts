import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  handleParse,
  handleSaveReceipt,
  handleGetReceipts,
  handleGetReceiptById,
} from "../controllers/receiptController.js";

const router = Router();

// Parse a receipt image via LLM
router.post("/parse", upload.single("receipt"), handleParse);

// Save a corrected receipt
router.post("/receipts", handleSaveReceipt);

// List all saved receipts
router.get("/receipts", handleGetReceipts);

// Get a single receipt by ID
router.get("/receipts/:id", handleGetReceiptById);

export default router;
