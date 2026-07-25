import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  preview: string | null;
  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export default function DropZone({
  onFileSelect,
  preview,
  disabled,
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: 10 * 1024 * 1024,
      maxFiles: 1,
      disabled,
    });

  const rejectionMessage = fileRejections.length > 0
    ? fileRejections[0].errors.map((e) => e.message).join(", ")
    : null;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
            : isDragActive
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-500">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-4xl block">📸</span>
            <p className="text-gray-700 font-medium">
              {isDragActive
                ? "Drop receipt here..."
                : "Drag & drop a receipt image"}
            </p>
            <p className="text-sm text-gray-400">
              JPG, JPEG, or PNG — Max 10MB
            </p>
          </div>
        )}
      </div>

      {rejectionMessage && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {rejectionMessage}
        </p>
      )}
    </div>
  );
}
