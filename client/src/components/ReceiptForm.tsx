import { useForm, useFieldArray } from "react-hook-form";
import type { ParsedReceipt, ReceiptFormData, Confidence } from "../types/receipt";
import ConfidenceField from "./ConfidenceField";
import LineItemsTable from "./LineItemsTable";

interface ReceiptFormProps {
  defaultValues: ParsedReceipt;
  confidence?: Confidence;
  onSubmit: (data: ReceiptFormData) => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export default function ReceiptForm({
  defaultValues,
  confidence,
  onSubmit,
  isSubmitting,
  readOnly,
}: ReceiptFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReceiptFormData>({
    defaultValues: {
      merchant: defaultValues.merchant ?? "",
      date: defaultValues.date ?? "",
      currency: defaultValues.currency ?? "",
      subtotal: defaultValues.subtotal?.toString() ?? "",
      tax: defaultValues.tax?.toString() ?? "",
      tip: defaultValues.tip?.toString() ?? "",
      discount: defaultValues.discount?.toString() ?? "",
      total: defaultValues.total?.toString() ?? "",
      lineItems: defaultValues.lineItems.map((item) => ({
        name: item.name,
        amount: item.amount.toString(),
      })),
    },
  });

  const fieldArray = useFieldArray({ control, name: "lineItems" });

  const inputClass = `w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
    readOnly ? "bg-gray-50 cursor-default" : "bg-white"
  }`;

  const numberFields = [
    { name: "subtotal" as const, label: "Subtotal" },
    { name: "tax" as const, label: "Tax" },
    { name: "tip" as const, label: "Tip" },
    { name: "discount" as const, label: "Discount" },
    { name: "total" as const, label: "Total" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Header Fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          Receipt Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ConfidenceField
            label="Merchant"
            confidence={confidence?.merchant}
          >
            <input
              {...register("merchant")}
              readOnly={readOnly}
              placeholder="Store name"
              className={inputClass}
            />
          </ConfidenceField>

          <ConfidenceField label="Date" confidence={confidence?.date}>
            <input
              {...register("date")}
              readOnly={readOnly}
              placeholder="YYYY-MM-DD"
              className={inputClass}
            />
          </ConfidenceField>

          <ConfidenceField
            label="Currency"
            confidence={confidence?.currency}
          >
            <input
              {...register("currency")}
              readOnly={readOnly}
              placeholder="USD"
              className={inputClass}
            />
          </ConfidenceField>
        </div>
      </div>

      {/* Amount Fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Amounts</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {numberFields.map(({ name, label }) => (
            <ConfidenceField
              key={name}
              label={label}
              confidence={confidence?.[name]}
            >
              <input
                {...register(name, {
                  validate: (v) =>
                    v === "" || !isNaN(Number(v)) || "Must be a number",
                })}
                readOnly={readOnly}
                placeholder="0.00"
                className={inputClass}
              />
              {errors[name] && (
                <p className="text-xs text-red-500 mt-1">
                  {errors[name]?.message}
                </p>
              )}
            </ConfidenceField>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <LineItemsTable
          register={register}
          fieldArray={fieldArray}
          errors={errors}
          confidence={confidence?.lineItems}
          readOnly={readOnly}
        />
      </div>

      {/* Submit */}
      {!readOnly && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Saving..." : "Save Receipt"}
        </button>
      )}
    </form>
  );
}
