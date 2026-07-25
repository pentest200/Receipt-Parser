import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DropZone from "../components/DropZone";
import Spinner from "../components/Spinner";
import { useParseReceipt } from "../hooks/useReceipts";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const parseMutation = useParseReceipt();

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  }, []);

  const handleParse = async () => {
    if (!file) {
      toast.error("Please select a receipt image first");
      return;
    }

    try {
      const result = await parseMutation.mutateAsync(file);
      toast.success("Receipt parsed successfully!");
      // Navigate to review page with parsed data
      navigate("/review", { state: { parsed: result } });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse receipt";
      // Try to extract server error message from Axios error
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Upload Receipt
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a receipt image and our AI will extract the data for you to
          review and correct.
        </p>
      </div>

      <DropZone
        onFileSelect={handleFileSelect}
        preview={preview}
        disabled={parseMutation.isPending}
      />

      {parseMutation.isPending ? (
        <Spinner text="Analyzing receipt with AI..." />
      ) : (
        <button
          onClick={handleParse}
          disabled={!file || parseMutation.isPending}
          className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Parse Receipt
        </button>
      )}
    </div>
  );
}
