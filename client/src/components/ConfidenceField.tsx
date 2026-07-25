import { getConfidenceStyle, getConfidenceTooltip } from "../utils/helpers";

interface ConfidenceFieldProps {
  label: string;
  confidence?: number;
  children: React.ReactNode;
}

/**
 * Wraps an input field with confidence-based highlighting and tooltip.
 * - <40%: Red background (likely wrong)
 * - 40-69%: Yellow background (review suggested)
 * - ≥70%: Default (high confidence)
 */
export default function ConfidenceField({
  label,
  confidence,
  children,
}: ConfidenceFieldProps) {
  const style = getConfidenceStyle(confidence);
  const tooltip = getConfidenceTooltip(confidence);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {confidence !== undefined && confidence < 0.7 && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full font-medium ${
              confidence < 0.4
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
            title={tooltip}
          >
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
      <div className={`rounded-lg ${style}`} title={tooltip}>
        {children}
      </div>
    </div>
  );
}
