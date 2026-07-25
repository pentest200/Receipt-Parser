import type {
  UseFormRegister,
  UseFieldArrayReturn,
  FieldErrors,
} from "react-hook-form";
import type { ReceiptFormData } from "../types/receipt";
import { getConfidenceStyle, getConfidenceTooltip } from "../utils/helpers";

interface LineItemsTableProps {
  register: UseFormRegister<ReceiptFormData>;
  fieldArray: UseFieldArrayReturn<ReceiptFormData, "lineItems">;
  errors: FieldErrors<ReceiptFormData>;
  confidence?: number;
  readOnly?: boolean;
}

export default function LineItemsTable({
  register,
  fieldArray,
  errors,
  confidence,
  readOnly,
}: LineItemsTableProps) {
  const { fields, append, remove } = fieldArray;
  const style = getConfidenceStyle(confidence);
  const tooltip = getConfidenceTooltip(confidence);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">Line Items</h3>
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
        {!readOnly && (
          <button
            type="button"
            onClick={() => append({ name: "", amount: "" })}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            + Add Item
          </button>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">No line items</p>
          {!readOnly && (
            <button
              type="button"
              onClick={() => append({ name: "", amount: "" })}
              className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
            >
              Add the first item
            </button>
          )}
        </div>
      ) : (
        <div className={`rounded-lg overflow-hidden border border-gray-200 ${style}`}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2 w-32">
                  Amount
                </th>
                {!readOnly && (
                  <th className="w-12 px-4 py-2" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, index) => (
                <tr key={field.id} className="group">
                  <td className="px-4 py-2">
                    <input
                      {...register(`lineItems.${index}.name`, {
                        required: "Name is required",
                      })}
                      readOnly={readOnly}
                      placeholder="Item name"
                      className={`w-full text-sm bg-transparent border-0 focus:ring-0 p-0 text-gray-900 placeholder-gray-300 ${
                        readOnly ? "cursor-default" : ""
                      }`}
                    />
                    {errors.lineItems?.[index]?.name && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {errors.lineItems[index]?.name?.message}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      {...register(`lineItems.${index}.amount`, {
                        required: "Required",
                        validate: (v) =>
                          !isNaN(Number(v)) || "Must be a number",
                      })}
                      readOnly={readOnly}
                      placeholder="0.00"
                      className={`w-full text-sm bg-transparent border-0 focus:ring-0 p-0 text-gray-900 placeholder-gray-300 ${
                        readOnly ? "cursor-default" : ""
                      }`}
                    />
                    {errors.lineItems?.[index]?.amount && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {errors.lineItems[index]?.amount?.message}
                      </p>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
