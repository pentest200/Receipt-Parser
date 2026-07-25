import axios from "axios";
import type { ParsedReceipt, Receipt } from "../types/receipt";

const api = axios.create({
  baseURL: "/api",
});

/**
 * Upload a receipt image for LLM parsing.
 */
export async function parseReceipt(file: File): Promise<ParsedReceipt> {
  const formData = new FormData();
  formData.append("receipt", file);

  const { data } = await api.post<ParsedReceipt>("/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // 60s timeout for LLM processing
  });

  return data;
}

/**
 * Save a corrected receipt to the database.
 */
export async function saveReceipt(
  receipt: Omit<Receipt, "id" | "createdAt" | "updatedAt">
): Promise<Receipt> {
  const { data } = await api.post<Receipt>("/receipts", receipt);
  return data;
}

/**
 * Fetch all saved receipts.
 */
export async function getReceipts(): Promise<Receipt[]> {
  const { data } = await api.get<Receipt[]>("/receipts");
  return data;
}

/**
 * Fetch a single receipt by ID.
 */
export async function getReceipt(id: string): Promise<Receipt> {
  const { data } = await api.get<Receipt>(`/receipts/${id}`);
  return data;
}
