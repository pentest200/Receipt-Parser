import { useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReceiptForm from "../components/ReceiptForm";
import { useSaveReceipt } from "../hooks/useReceipts";
import type { ParsedReceipt, ReceiptFormData } from "../types/receipt";

export default function ReviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const saveMutation = useSaveReceipt();

  const parsed = location.state?.parsed as ParsedReceipt | undefined;

  // Redirect to upload if no parsed data
  if (!parsed) {
    return <Navigate to="/upload" replace />;
  }

  const handleSubmit = async (formData: ReceiptFormData) => {
    try {
      const receipt = {
        merchant: formData.merchant || null,
        date: formData.date || null,
        currency: formData.currency || null,
        subtotal: formData.subtotal ? Number(formData.subtotal) : null,
        tax: formData.tax ? Number(formData.tax) : null,
        tip: formData.tip ? Number(formData.tip) : null,
        discount: formData.discount ? Number(formData.discount) : null,
        total: formData.total ? Number(formData.total) : null,
        lineItems: formData.lineItems.map((item) => ({
          name: item.name,
          amount: Number(item.amount),
        })),
      };

      await saveMutation.mutateAsync(receipt);
      toast.success("Receipt saved!");
      navigate("/");
    } catch {
      toast.error("Failed to save receipt");
    }
  };

  // Count fields that need review
  const lowConfidenceCount = parsed.confidence
    ? Object.values(parsed.confidence).filter(
        (v) => typeof v === "number" && v < 0.7
      ).length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Review Extracted Data
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review the AI-extracted data below. Edit any incorrect values before
          saving.
        </p>
        {lowConfidenceCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg">
            <span>⚠️</span>
            <span>
              {lowConfidenceCount} field{lowConfidenceCount !== 1 ? "s" : ""}{" "}
              flagged for review. Highlighted fields may need correction.
            </span>
          </div>
        )}
      </div>

      <ReceiptForm
        defaultValues={parsed}
        confidence={parsed.confidence}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      />
    </div>
  );
}
