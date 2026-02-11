"use client";

import { useEffect, useRef, useState } from "react";

type Item = { value?: string; label?: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  apiUrl: string;
  queryParam?: string;
};

export default function AutoSuggestInput({ value, onChange, placeholder, apiUrl, queryParam = "q" }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (!q) {
      setItems([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${queryParam}=${encodeURIComponent(q)}`;
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        setItems(json.items ?? []);
        setOpen(true);
      } catch (e) {
        console.error("AutoSuggest fetch error:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value, apiUrl, queryParam]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-sm transition-all duration-200
                     placeholder:text-slate-400 dark:placeholder:text-slate-500"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 
                        bg-white dark:bg-slate-800 shadow-2xl max-h-64 overflow-y-auto
                        animate-fade-in backdrop-blur-xl">
          {loading && (
            <div className="p-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="p-3 text-sm text-slate-500 dark:text-slate-400">
              No matches found
            </div>
          )}
          {!loading &&
            items.map((it, i) => (
              <button
                key={(it.value ?? "") + i}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700/50
                           transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl
                           border-b border-slate-100 dark:border-slate-700 last:border-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(it.value ?? "");
                  setOpen(false);
                }}
              >
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {it.label ?? it.value}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
