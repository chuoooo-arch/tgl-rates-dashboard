"use client";

import { useState } from "react";

type ImportResult = {
  ok: boolean;
  error?: string;
  importer?: string;
  sheet?: string;
  totalRows?: number;
  inserted?: number;
  skipped?: number;
};

export default function UploadExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
    setResult(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please choose an Excel file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as ImportResult;

      if (!response.ok || !data.ok) {
        setError(data.error || "Import failed.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-xl border-2 border-dashed border-blue-200 p-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-50 text-blue-600" />
          <p className="text-sm text-gray-600">Drag & drop your Excel file here</p>
          <p className="text-xs text-gray-400">or click to browse</p>
          <label className="mt-3 inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Choose File
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          {file ? (
            <div className="mt-3 text-xs text-gray-600">Selected: {file.name}</div>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUploading}
        >
          {isUploading ? "Importing..." : "Import Rates"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {error}
        </div>
      ) : null}

      {result?.ok ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Imported using {result.importer} ({result.sheet}). Rows: {result.totalRows}, inserted: {result.inserted}, skipped: {result.skipped}
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Supported formats</div>
        <ul className="space-y-1">
          <li>Air rates: Origin(Airport), Destination(Airport), +45, +100, +300, +500, +1000</li>
          <li>Sea FCL rates: POL, POD, 20GP, 40GP, 40HC</li>
          <li>Sea LCL rates: POL, POD, W/M, Min Charge, Refund Freight</li>
        </ul>
      </div>
    </div>
  );
}
