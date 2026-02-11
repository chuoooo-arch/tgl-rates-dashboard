"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CompareModal from "./ui/CompareModal";
import AutoSuggestInput from "./ui/AutoSuggestInput";

type Mode = "SEA_FCL" | "SEA_LCL" | "AIR";
type Sort = "price_asc" | "price_desc" | "transit_asc" | "transit_desc" | "name_asc";

type Option = { v: string; label: string };

const BASE_OPTIONS: Record<string, Option[]> = {
  SEA_FCL: [
    { v: "20GP", label: "20' GP" },
    { v: "40GP", label: "40' GP" },
    { v: "40HC", label: "40' HC" },
    { v: "20RF", label: "20' RF" },
    { v: "40RF", label: "40' RF" },
  ],
  SEA_LCL: [
    { v: "NET", label: "Net Cost (Lowest)" },
    { v: "WM", label: "W/M" },
    { v: "MIN", label: "Min Charge" },
    { v: "REFUND", label: "Refund" },
  ],
  AIR: [
    { v: "R45", label: "+45" },
    { v: "R100", label: "+100" },
    { v: "R300", label: "+300" },
    { v: "R500", label: "+500" },
    { v: "R1000", label: "+1000" },
    { v: "MIN", label: "Min" },
    { v: "S1000", label: "Surcharge 1000" },
  ],
};

const SORT_OPTIONS: Record<string, Option[]> = {
  SEA_FCL: [
    { v: "price_asc", label: "Price (Lowest First)" },
    { v: "price_desc", label: "Price (Highest First)" },
    { v: "transit_asc", label: "Transit Time" },
    { v: "name_asc", label: "Carrier A–Z" },
  ],
  SEA_LCL: [
    { v: "price_asc", label: "Price (Lowest First)" },
    { v: "price_desc", label: "Price (Highest First)" },
    { v: "transit_asc", label: "Transit Time" },
    { v: "name_asc", label: "Carrier A–Z" },
  ],
  AIR: [
    { v: "price_asc", label: "Price (Lowest First)" },
    { v: "price_desc", label: "Price (Highest First)" },
    { v: "transit_asc", label: "Transit Time" },
    { v: "name_asc", label: "Airline A–Z" },
  ],
};

const FIELD_MAP: Record<string, Record<string, string>> = {
  SEA_FCL: { "20GP": "rate20gp", "40GP": "rate40gp", "40HC": "rate40hc", "20RF": "rate20rf", "40RF": "rate40rf" },
  SEA_LCL: { "NET": "netCost", "WM": "wm", "MIN": "minCharge", "REFUND": "refundFreight" },
  AIR: { "R45": "rate45", "R100": "rate100", "R300": "rate300", "R500": "rate500", "R1000": "rate1000", "MIN": "min", "S1000": "surcharge1000" },
};

function tierFromWeight(weightKg: number) {
  if (weightKg <= 45) return "rate45";
  if (weightKg <= 100) return "rate100";
  if (weightKg <= 300) return "rate300";
  if (weightKg <= 500) return "rate500";
  return "rate1000";
}

function labelForBase(mode: Mode, base: string) {
  return BASE_OPTIONS[mode]?.find((o) => o.v === base)?.label ?? base;
}

export default function RatesClient({
  initial,
}: {
  initial: {
    mode?: string;
    origin?: string;
    destination?: string;
    carrier?: string;
    validFrom?: string;
    validTo?: string;
  };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>((initial.mode as Mode) || "SEA_FCL");
  
  // Draft state (ค่าที่กำลังพิมพ์)
  const [draft, setDraft] = useState({
    origin: initial.origin || "",
    destination: initial.destination || "",
    carrier: initial.carrier || "",
    validFrom: initial.validFrom || "",
    validTo: initial.validTo || "",
  });

  // Applied state (ค่าที่ใช้ query จริง)
  const [applied, setApplied] = useState(draft);

  const [base, setBase] = useState(mode === "SEA_FCL" ? "20GP" : mode === "SEA_LCL" ? "NET" : "R100");
  const [sort, setSort] = useState<Sort>("price_asc");
  const [weight, setWeight] = useState("");

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(20);

  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("mode", mode);
    p.set("base", base);
    p.set("sort", sort);
    p.set("page", String(page));
    p.set("take", String(take));
    if (applied.origin) p.set("origin", applied.origin);
    if (applied.destination) p.set("destination", applied.destination);
    if (applied.carrier) p.set("carrier", applied.carrier);
    if (applied.validFrom) p.set("validFrom", applied.validFrom);
    if (applied.validTo) p.set("validTo", applied.validTo);
    if (mode === "AIR" && weight) p.set("weight", weight);
    return p.toString();
  }, [mode, base, sort, page, take, applied, weight]);

  async function fetchRates() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rates?${qs}`, { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setRows(json.items ?? []);
        setTotal(json.total ?? 0);
        router.replace(`/rates?${qs}`, { scroll: false });
      } else {
        setRows([]);
        setTotal(0);
        console.error("API error:", json.error);
      }
    } catch (e) {
      console.error("Fetch error:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  useEffect(() => {
    setSort("price_asc");
    setWeight("");
    setBase(mode === "SEA_FCL" ? "20GP" : mode === "SEA_LCL" ? "NET" : "R100");
    setPage(1);
    // Reset draft filters when changing mode
    setDraft({
      origin: "",
      destination: "",
      carrier: "",
      validFrom: "",
      validTo: "",
    });
    setApplied({
      origin: "",
      destination: "",
      carrier: "",
      validFrom: "",
      validTo: "",
    });
  }, [mode]);

  function getRowId(r: any, i: number) {
    return String(r.id ?? r.fingerprint ?? `${r.mode}-${r.origin}-${r.destination}-${r.carrier}-${i}`);
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // จำกัด 3
      return [...prev, id];
    });
  }

  function onSearch() {
    setApplied(draft);
    setPage(1);
  }

  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(applied);

  const originLabel = mode === "AIR" ? "Origin (Airport)" : "POL (Origin)";
  const destLabel = mode === "AIR" ? "Destination (Airport)" : "POD (Destination)";

  const totalPages = Math.max(1, Math.ceil(total / take));
  const weightKg = Number(weight || "0");
  const airTierField = mode === "AIR" && weightKg > 0 ? tierFromWeight(weightKg) : FIELD_MAP.AIR[base];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Rates Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Compare shipping rates across {mode} routes
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-3 mb-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          {(["SEA_FCL", "SEA_LCL", "AIR"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-300 transform hover:scale-105
                ${mode === m
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
                }
              `}
            >
              {m.replace("SEA_", "")}
            </button>
          ))}
        </div>

        {/* Filters Card */}
        <div 
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 animate-slide-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {originLabel}
              </label>
              <AutoSuggestInput
                value={draft.origin}
                onChange={(v) => setDraft((p) => ({ ...p, origin: v }))}
                placeholder={mode === "AIR" ? "Origin (Airport) e.g. BKK" : "POL (Port) e.g. SIN"}
                apiUrl={`/api/lookup/locations?type=${mode === "AIR" ? "airport" : "port"}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {destLabel}
              </label>
              <AutoSuggestInput
                value={draft.destination}
                onChange={(v) => setDraft((p) => ({ ...p, destination: v }))}
                placeholder={mode === "AIR" ? "Destination (Airport) e.g. LAX" : "POD (Port) e.g. LAX"}
                apiUrl={`/api/lookup/locations?type=${mode === "AIR" ? "airport" : "port"}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Carrier
              </label>
              <AutoSuggestInput
                value={draft.carrier}
                onChange={(v) => setDraft((p) => ({ ...p, carrier: v }))}
                placeholder="Carrier / Airline"
                apiUrl="/api/lookup/partners?type=carrier"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Valid From
              </label>
              <input
                type="date"
                value={draft.validFrom}
                onChange={(e) => setDraft((p) => ({ ...p, validFrom: e.target.value }))}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Valid To
              </label>
              <input
                type="date"
                value={draft.validTo}
                onChange={(e) => setDraft((p) => ({ ...p, validTo: e.target.value }))}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Base</span>
            <select 
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border-0 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500"
              value={base} 
              onChange={(e) => setBase(e.target.value)}
            >
              {BASE_OPTIONS[mode].map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "AIR" && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Weight (kg)</span>
              <input
                className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border-0 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500"
                inputMode="numeric"
                placeholder="e.g. 120"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value.replace(/[^\d]/g, ""));
                  setPage(1);
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <select 
              className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-500"
              value={sort} 
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              {SORT_OPTIONS[mode].map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label}
                </option>
              ))}
            </select>

            {hasDraftChanges && (
              <span className="flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg animate-fade-in">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Changes pending
              </span>
            )}

            <button 
              onClick={onSearch}
              className={`
                px-6 py-2 rounded-lg font-semibold text-sm
                transition-all duration-300 transform hover:scale-105
                ${hasDraftChanges 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }
              `}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {rows.length === 0 && !loading ? (
          <div className="text-center py-16 px-6 text-slate-500 dark:text-slate-400 animate-fade-in">
            <svg className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No rates found</p>
            <p className="text-sm mt-2">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in">
            {rows.map((row, i) => {
              const id = getRowId(row, i);
              const checked = compareIds.includes(id);
              const baseField = FIELD_MAP[mode][base];
              const baseValue = baseField ? (row as any)[baseField] ?? null : null;

              const selectedAirField = mode === "AIR" ? airTierField : null;

              const netCost = mode === "SEA_LCL"
                ? (row.netCost ?? (typeof row.wm === "number" || typeof row.minCharge === "number" ? (row.wm ?? row.minCharge ?? 0) + (row.refundFreight ?? 0) : null))
                : null;

              return (
                <div
                  key={row.id}
                  className="relative flex flex-wrap justify-between items-center gap-6 p-6 bg-white dark:bg-slate-800 
                             border border-slate-200 dark:border-slate-700 rounded-xl shadow-md
                             hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <button
                    className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center absolute top-4 right-4 
                               transition-all duration-200 hover:scale-110
                               ${checked 
                                 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/30" 
                                 : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-blue-400"
                               }`}
                    onClick={() => toggleCompare(id)}
                    title="Add to compare (max 3)"
                  >
                    {checked ? "✓" : ""}
                  </button>

                  <div className="flex-1 min-w-[200px]">
                    <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {row.carrier ?? "N/A"}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{row.origin}</span>
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{row.destination}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {row.transitTime && (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Transit: {row.transitTime} days
                        </span>
                      )}
                      {row.etd && (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          ETD: {row.etd}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Valid: {fmt(row.validFrom)} → {fmt(row.validTo)}
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap items-center">
                    <PriceBox label={`Base: ${labelForBase(mode, base)}`} price={baseValue ?? (mode === "SEA_LCL" ? netCost : null)} currency={row.currency} isSelected />

                    {mode === "SEA_FCL" && (
                      <>
                        <PriceBox label="20' GP" price={row.rate20gp} currency={row.currency} />
                        <PriceBox label="40' GP" price={row.rate40gp} currency={row.currency} />
                        <PriceBox label="40' HC" price={row.rate40hc} currency={row.currency} />
                      </>
                    )}

                    {mode === "SEA_LCL" && (
                      <>
                        <PriceBox label="W/M" price={row.wm} currency={row.currency} />
                        <PriceBox label="Min" price={row.minCharge} currency={row.currency} />
                        <PriceBox label="Refund" price={row.refundFreight} currency={row.currency} />
                        <PriceBox label="Net" price={netCost} currency={row.currency} />
                      </>
                    )}

                    {mode === "AIR" && (
                      <>
                        <PriceBox label="+45" price={row.rate45} currency={row.currency} isSelected={selectedAirField === "rate45"} />
                        <PriceBox label="+100" price={row.rate100} currency={row.currency} isSelected={selectedAirField === "rate100"} />
                        <PriceBox label="+300" price={row.rate300} currency={row.currency} isSelected={selectedAirField === "rate300"} />
                        <PriceBox label="+500" price={row.rate500} currency={row.currency} isSelected={selectedAirField === "rate500"} />
                        <PriceBox label="+1000" price={row.rate1000} currency={row.currency} isSelected={selectedAirField === "rate1000"} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 mt-8 justify-center items-center flex-wrap animate-fade-in">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))} 
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                         ${page === 1 
                           ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                           : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:shadow-md"
                         }`}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button 
                key={p} 
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                           ${page === p 
                             ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" 
                             : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:shadow-md"
                           }`}
              >
                {p}
              </button>
            ))}
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))} 
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                         ${page === totalPages 
                           ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                           : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:shadow-md"
                         }`}
            >
              Next →
            </button>
          </div>
        )}

        {/* Compare Floating Bar */}
        {compareIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 
                            bg-white dark:bg-slate-800 px-6 py-4 shadow-2xl backdrop-blur-xl">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Compare <span className="font-bold text-blue-600 dark:text-blue-400">{compareIds.length}</span>/3 selected
              </div>

              <button
                className="rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm font-medium 
                           text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 
                           transition-colors duration-200"
                onClick={() => setCompareIds([])}
              >
                Clear
              </button>

              <button
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-semibold 
                           text-white hover:shadow-xl hover:scale-105 transition-all duration-200 
                           shadow-lg shadow-blue-500/30"
                onClick={() => setShowCompare(true)}
              >
                Compare
              </button>
            </div>
          </div>
        )}

        <CompareModal
          open={showCompare}
          onClose={() => setShowCompare(false)}
          mode={mode}
          items={rows
            .map((r, i) => ({ r, id: getRowId(r, i) }))
            .filter((x) => compareIds.includes(x.id))
            .map((x) => x.r)}
        />
      </div>
    </div>
  );
}

function fmt(d?: any) {
  if (!d) return "—";
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? "—" : x.toISOString().slice(0, 10);
}

function PriceBox({
  label,
  price,
  currency,
  isSelected,
}: {
  label: string;
  price: number | null | undefined;
  currency: string | undefined;
  isSelected?: boolean;
}) {
  const hasPrice = price !== null && price !== undefined;

  return (
    <div 
      className={`text-center px-4 py-3 rounded-lg min-w-[110px] transition-all duration-200
                 ${isSelected 
                   ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-400 dark:border-blue-600 shadow-md" 
                   : "bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                 }`}
    >
      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-sm font-bold ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}>
        {hasPrice ? `${currency ?? "USD"} ${Number(price).toLocaleString()}` : "—"}
      </div>
    </div>
  );
}

