"use client";

import { useState, useEffect } from "react";

interface PasswordProtectProps {
  children: React.ReactNode;
  correctPassword: string;
}

export default function PasswordProtect({
  children,
  correctPassword,
}: PasswordProtectProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage for saved password
    const saved = localStorage.getItem("rates-password-unlocked");
    if (saved === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsUnlocked(true);
      localStorage.setItem("rates-password-unlocked", "true");
      setError("");
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                TGL FreightIntel
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Smart Freight Rate Intelligence Platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                    <span className="inline-block">⚠</span> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Unlock
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
              Powered by Thai Global Logistics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
