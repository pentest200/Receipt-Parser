import { useParams, Link } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipts";
import ReceiptForm from "../components/ReceiptForm";
import Spinner from "../components/Spinner";
import type { ParsedReceipt, ReceiptFormData } from "../types/receipt";

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: receipt, isLoading, error } = useReceipt(id!);

  if (isLoading) return <Spinner text="Loading receipt..." />;

  if (error || !receipt) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Receipt not found or failed to load.
        </div>
        <Link
          to="/"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← Back to receipts
        </Link>
      </div>
    );
  }

  // Map saved receipt to ParsedReceipt shape for the form
  const formData: ParsedReceipt = {
    merchant: receipt.merchant,
    date: receipt.date,
    currency: receipt.currency,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    tip: receipt.tip,
    discount: receipt.discount,
    total: receipt.total,
    lineItems: receipt.lineItems,
    confidence: {},
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          {receipt.merchant || "Receipt"}
        </h1>
      </div>

      <ReceiptForm
        defaultValues={formData}
        onSubmit={(_data: ReceiptFormData) => {}}
        readOnly
      />

      <p className="text-xs text-gray-400">
        Saved on{" "}
        {new Date(receipt.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
