import { Link } from "react-router-dom";
import type { Receipt } from "../types/receipt";
import { formatCurrency, formatDate } from "../utils/helpers";

interface ReceiptCardProps {
  receipt: Receipt;
}

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  return (
    <Link
      to={`/receipts/${receipt.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {receipt.merchant || "Unknown Merchant"}
          </h3>
          <p className="text-xs text-gray-500">
            {formatDate(receipt.date)}
          </p>
          <p className="text-xs text-gray-400">
            {receipt.lineItems.length} item{receipt.lineItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(receipt.total, receipt.currency)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {receipt.currency || "USD"}
          </p>
        </div>
      </div>
    </Link>
  );
}
