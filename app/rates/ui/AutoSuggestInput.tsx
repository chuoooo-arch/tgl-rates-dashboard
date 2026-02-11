"use client";

import { useState, useRef, useEffect } from "react";

interface AutoSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  apiUrl: string;
}

interface Suggestion {
  label: string;
}

export default function AutoSuggestInput({
  value,
  onChange,
  placeholder,
  apiUrl,
}: AutoSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value });
        const res = await fetch(`${apiUrl}&${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Lookup error:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [value, apiUrl]);

  const handleSelect = (label: string) => {
    onChange(label);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim() && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(suggestion.label)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
