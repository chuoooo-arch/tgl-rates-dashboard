"use client";
import { useState } from "react";

export default function UploadPage() {
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      setMsg("❌ Please select an Excel file first");
      return;
    }

    setUploading(true);
    setMsg("Uploading and processing...");

    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      setMsg(JSON.stringify(json, null, 2));
    } catch (error) {
      setMsg(`❌ Error: ${error}`);
    } finally {
      setUploading(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const form = document.querySelector("form") as HTMLFormElement;
      const input = form.querySelector('input[type="file"]') as HTMLInputElement;
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      input.files = dt.files;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Upload Excel File
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Import rate data from Excel files (AIR, SEA FCL, SEA LCL)
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-6 animate-fade-in"
             style={{ animationDelay: '0.1s' }}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                         ${dragActive 
                           ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                           : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
                         }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="pointer-events-none">
                <svg className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Drag & drop your Excel file here
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  or click the button below to browse
                </p>
              </div>
              
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                               font-semibold cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200
                               shadow-lg shadow-blue-500/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Choose File
                <input 
                  name="file" 
                  type="file" 
                  accept=".xlsx,.xls" 
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={uploading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
                         ${uploading
                           ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                           : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:scale-[1.02] shadow-lg shadow-blue-500/30"
                         }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Import Rates"
              )}
            </button>
          </form>
        </div>

        {/* Result Message */}
        {msg && (
          <div className={`rounded-2xl p-6 animate-fade-in border
                          ${msg.startsWith("❌") 
                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                            : msg.includes('"ok": true') || msg.includes('"ok":true')
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          }`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {msg.startsWith("❌") ? (
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (msg.includes('"ok": true') || msg.includes('"ok":true')) ? (
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap break-words">
                  {msg}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 animate-fade-in"
             style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Supported Formats
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span><strong>AIR rates:</strong> Origin(Airport), Destination(Airport), +45, +100, +300, +500, +1000</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span><strong>SEA FCL rates:</strong> POL, POD, 20'GP, 40'GP, 40'HC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span><strong>SEA LCL rates:</strong> POL, POD, W/M, Min Charge, Refund Freight</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
