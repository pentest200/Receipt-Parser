import { Link } from "react-router-dom";
import { useReceipts } from "../hooks/useReceipts";
import ReceiptCard from "../components/ReceiptCard";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

export default function HomePage() {
  const { data: receipts, isLoading, error } = useReceipts();

  if (isLoading) return <Spinner text="Loading receipts..." />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        Failed to load receipts. Please try again.
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="No receipts yet"
        description="Upload your first receipt to get started. The AI will extract and structure all the data for you."
        action={
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload Receipt
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Saved Receipts
        </h1>
        <span className="text-sm text-gray-500">
          {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-3">
        {receipts.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </div>
    </div>
  );
}
