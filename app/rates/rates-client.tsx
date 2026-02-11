"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "SEA_FCL" | "SEA_LCL" | "AIR";
type Sort = "price_asc" | "price_desc" | "transit_asc" | "transit_desc" | "carrier_asc" | "name_asc" | "refund_desc";

export default function RatesClient({
  initial,
}: {
  initial: {
    mode?: string;
    origin?: string;
    destination?: string;
    carrier?: string;
    validDate?: string;
  };
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>((initial.mode as Mode) || "SEA_FCL");
  const [origin, setOrigin] = useState(initial.origin || "");
  const [destination, setDestination] = useState(initial.destination || "");
  const [carrier, setCarrier] = useState(initial.carrier || "");
  const [validDate, setValidDate] = useState(initial.validDate || "");
  const [weight, setWeight] = useState<string>("");

  const [sort, setSort] = useState<Sort>("price_asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const baseOptionsByMode = useMemo(() => ({
    SEA_FCL: [
      { v: "20GP", label: "20' GP" },
      { v: "40GP", label: "40' GP" },
      { v: "40HC", label: "40' HC" },
      { v: "20RF", label: "20' RF" },
      { v: "40RF", label: "40' RF" },
    ],
    SEA_LCL: [
      { v: "WM", label: "W/M Rate" },
      { v: "MIN_CHARGE", label: "Min Charge" },
      { v: "REFUND_FREIGHT", label: "Refund Freight" },
      { v: "NET_COST", label: "Net Cost" },
    ],
    AIR: [
      { v: "MIN", label: "Min" },
      { v: "R45", label: "+45" },
      { v: "R100", label: "+100" },
      { v: "R300", label: "+300" },
      { v: "R500", label: "+500" },
      { v: "R1000", label: "+1000" },
      { v: "S1000", label: "Surcharge 1000" },
    ],
  } as const), []);

  const defaultBaseForMode: Record<Mode, string> = {
    SEA_FCL: "20GP",
    SEA_LCL: "WM",
    AIR: "R100",
  };

  const [base, setBase] = useState<string>(defaultBaseForMode[mode]);
  const sortOptionsByMode: Record<Mode, { v: string; label: string }[]> = {
    SEA_FCL: [
      { v: "price_asc", label: "Price (Lowest First)" },
      { v: "transit_asc", label: "Transit Time (Fastest)" },
      { v: "name_asc", label: "Carrier A–Z" },
    ],
    SEA_LCL: [
      { v: "price_asc", label: "Price (Lowest First)" },
      { v: "transit_asc", label: "Transit Time (Fastest)" },
      { v: "name_asc", label: "Carrier A–Z" },
      { v: "refund_desc", label: "Refund (Most Discount)" },
    ],
    AIR: [
      { v: "price_asc", label: "Price (Lowest First)" },
      { v: "transit_asc", label: "Transit Time (Fastest)" },
      { v: "name_asc", label: "Airline A–Z" },
    ],
  };

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    p.set("mode", mode);
    if (origin) p.set("origin", origin);
    if (destination) p.set("destination", destination);
    if (carrier) p.set("carrier", carrier);
    if (validDate) p.set("validDate", validDate);
    if (base) p.set("baseContainer", base);
    if (weight) p.set("weight", weight);
    p.set("sort", sort);
    p.set("page", String(page));
    p.set("pageSize", String(pageSize));
    return p.toString();
  }, [mode, origin, destination, carrier, validDate, sort, page, pageSize, base, weight]);

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
    setBase(defaultBaseForMode[mode]);
    setPage(1);
    setSort("price_asc");
    setWeight("");
  }, [mode]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Field maps for reading row values for the selected base
  const FIELD_MAP_BY_MODE: Record<string, Record<string, string>> = {
    SEA_FCL: { "20GP": "rate20gp", "40GP": "rate40gp", "40HC": "rate40hc", "20RF": "rate20rf", "40RF": "rate40rf" },
    SEA_LCL: { WM: "wm", MIN_CHARGE: "minCharge", REFUND_FREIGHT: "refundFreight", NET_COST: "netCost" },
    AIR: { MIN: "min", R45: "rate45", R100: "rate100", R300: "rate300", R500: "rate500", R1000: "rate1000", S1000: "surcharge1000" },
  };

  const labelForBase = (m: Mode, b: string) => {
    const opts = baseOptionsByMode[m] as any;
    return opts.find((o: any) => o.v === b)?.label ?? b;
  };

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "12px", fontSize: "28px", fontWeight: "700" }}>Rates Dashboard — {mode}</h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["SEA_FCL", "SEA_LCL", "AIR"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: mode === m ? "#111" : "#fff",
              color: mode === m ? "#fff" : "#111",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {m.replace("SEA_", "")}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "16px",
          padding: "12px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>
            {mode === "AIR" ? "Origin (Airport)" : mode === "SEA_LCL" ? "POL" : "Origin (POL)"}
          </label>
          <input
            type="text"
            placeholder="e.g., SIN"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>
            {mode === "AIR" ? "Destination (Airport)" : mode === "SEA_LCL" ? "POD" : "Destination (POD)"}
          </label>
          <input
            type="text"
            placeholder="e.g., LAX"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Carrier</label>
          <input
            type="text"
            placeholder="optional"
            value={carrier}
            onChange={(e) => {
              setCarrier(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Valid Date</label>
          <input
            type="date"
            value={validDate}
            onChange={(e) => {
              setValidDate(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          />
        </div>

        {mode === "AIR" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Weight (kg)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g., 120"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setPage(1);
              }}
              style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Base (for sorting)</label>
          <select
            value={base}
            onChange={(e) => {
              setBase(e.target.value);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", cursor: "pointer", background: "#fff" }}
          >
            {baseOptionsByMode[mode].map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Sort By</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort);
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", cursor: "pointer", background: "#fff" }}
          >
            {sortOptionsByMode[mode].map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}>Per Page</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", cursor: "pointer", background: "#fff" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        <button
          onClick={() => {
            setOrigin("");
            setDestination("");
            setCarrier("");
            setValidDate("");
            setPage(1);
            setSort("price_asc");
          }}
          style={{ padding: "8px 24px", background: "#ddd", color: "#111", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
        >
          Reset
        </button>

        <div style={{ marginLeft: "auto", fontSize: "13px", color: "#666" }}>{loading ? "Loading..." : `${total} results`}</div>
      </div>

      {/* Results */}
      {rows.length === 0 && !loading ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#999" }}>No rates found. Try adjusting your filters.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rows.map((row) => {
            // selected field key for this mode/base
            const fieldKey = (FIELD_MAP_BY_MODE as any)[mode][base] as string | undefined;
            const selectedPrice = fieldKey ? (row as any)[fieldKey] ?? null : null;

            return (
              <div
                key={row.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#fff", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", gap: "16px", flexWrap: "wrap" }}
              >
                <div style={{ flex: "1 1 300px", minWidth: "200px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#111", marginBottom: "4px" }}>{row.carrier ?? "N/A"}</div>
                  <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                    <strong>{row.origin}</strong> → <strong>{row.destination}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", display: "flex", gap: "12px" }}>
                    {row.transitTime && <span>Transit: {row.transitTime} days</span>}
                    {row.etd && <span>ETD: {row.etd}</span>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flex: "0 1 auto", alignItems: "center" }}>
                  {/* Render main selected base price */}
                  <PriceBox label={`${labelForBase(mode, base)} (Base)`} price={selectedPrice} currency={row.currency} isCheapest={false} />

                  {/* Extra: show a few common fields per mode for context */}
                  {mode === "SEA_FCL" && (
                    <>
                      <PriceBox label="20' GP" price={row.rate20gp} currency={row.currency} isCheapest={row.rate20gp === row.effectivePrice && row.effectivePrice !== null} />
                      <PriceBox label="40' GP" price={row.rate40gp} currency={row.currency} isCheapest={row.rate40gp === row.effectivePrice && row.effectivePrice !== null} />
                      <PriceBox label="40' HC" price={row.rate40hc} currency={row.currency} isCheapest={row.rate40hc === row.effectivePrice && row.effectivePrice !== null} />
                    </>
                  )}

                  {mode === "SEA_LCL" && (
                    <>
                      <PriceBox label="W/M" price={row.wm} currency={row.currency} isCheapest={false} />
                      <PriceBox label="Min Charge" price={row.minCharge} currency={row.currency} isCheapest={false} />
                      <PriceBox label="Refund Freight" price={row.refundFreight} currency={row.currency} isCheapest={false} />
                    </>
                  )}

                  {mode === "AIR" && (
                    <>
                      <PriceBox label="Min" price={row.min} currency={row.currency} isCheapest={false} />
                      <PriceBox label="+45" price={row.rate45} currency={row.currency} isCheapest={false} />
                      <PriceBox label="+100" price={row.rate100} currency={row.currency} isCheapest={false} />
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", flex: "0 1 auto" }}>
                  <button style={{ padding: "6px 12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Get Quote</button>
                  <button style={{ padding: "6px 12px", background: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Book</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "24px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{ padding: "6px 12px", background: page === 1 ? "#ddd" : "#f0f0f0", color: "#111", border: "1px solid #ddd", borderRadius: "4px", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "13px" }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: "6px 10px", background: page === p ? "#111" : "#f0f0f0", color: page === p ? "#fff" : "#111", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", fontWeight: page === p ? "700" : "600", fontSize: "13px" }}>
              {p}
            </button>
          ))}

          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: "6px 12px", background: page === totalPages ? "#ddd" : "#f0f0f0", color: "#111", border: "1px solid #ddd", borderRadius: "4px", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "13px" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function PriceBox({ label, price, currency, isCheapest }: { label: string; price: number | null | undefined; currency: string | undefined; isCheapest: boolean }) {
  const hasPrice = price !== null && price !== undefined;
  const bgColor = isCheapest && hasPrice ? "#fff3cd" : "#f9f9f9";
  const borderColor = isCheapest && hasPrice ? "#ffc107" : "#ddd";

  return (
    <div style={{ textAlign: "center", padding: "12px 10px", background: bgColor, border: `1px solid ${borderColor}`, borderRadius: "6px", minWidth: "100px" }}>
      <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px", fontWeight: "600" }}>{label}</div>
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{hasPrice ? `${currency ?? "USD"} ${Number(price).toLocaleString()}` : "—"}</div>
      {isCheapest && hasPrice && <div style={{ fontSize: "9px", color: "#ff6b00", fontWeight: "700", marginTop: "2px" }}>🔥 Best</div>}
    </div>
  );
}
