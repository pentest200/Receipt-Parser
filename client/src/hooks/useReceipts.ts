import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api";
import type { ParsedReceipt, Receipt } from "../types/receipt";

/**
 * Fetch all saved receipts.
 */
export function useReceipts() {
  return useQuery<Receipt[]>({
    queryKey: ["receipts"],
    queryFn: api.getReceipts,
  });
}

/**
 * Fetch a single receipt by ID.
 */
export function useReceipt(id: string) {
  return useQuery<Receipt>({
    queryKey: ["receipt", id],
    queryFn: () => api.getReceipt(id),
    enabled: !!id,
  });
}

/**
 * Mutation to parse a receipt image.
 */
export function useParseReceipt() {
  return useMutation<ParsedReceipt, Error, File>({
    mutationFn: api.parseReceipt,
  });
}

/**
 * Mutation to save a corrected receipt.
 */
export function useSaveReceipt() {
  const queryClient = useQueryClient();

  return useMutation<
    Receipt,
    Error,
    Omit<Receipt, "id" | "createdAt" | "updatedAt">
  >({
    mutationFn: api.saveReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
}
