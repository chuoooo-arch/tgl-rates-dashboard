"use client";
import { useState } from "react";

export default function UploadExcel() {
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-left">
            <h2 className="text-xl font-bold">Upload Excel File</h2>
            <p className="text-sm text-blue-100">Import rate data (AIR, SEA FCL, SEA LCL)</p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-6 space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
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
                <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Drag & drop your Excel file here
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  or click the button below
                </p>
              </div>
              
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                               font-semibold cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className={`w-full py-3 rounded-xl font-bold transition-all duration-300
                         ${uploading
                           ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                           : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.01] shadow-lg shadow-blue-500/30"
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

          {/* Result Message */}
          {msg && (
            <div className={`rounded-xl p-4 animate-fade-in border text-sm
                            ${msg.startsWith("❌") 
                              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                              : msg.includes('"ok": true') || msg.includes('"ok":true')
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            }`}>
              <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap break-words">
                {msg}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
