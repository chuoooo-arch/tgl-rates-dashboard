function money(n: number | null | undefined, ccy: string) {
  if (typeof n !== "number") return "—";
  return `${ccy} ${n.toLocaleString()}`;
}

export default function RateCardFcl({ r, baseContainer }: { r: any; baseContainer?: string }) {
  const ccy = r.currency ?? "USD";
  const prices = [
    { code: "20GP", label: "20' GP", val: r.rate20gp as number | null },
    { code: "40GP", label: "40' GP", val: r.rate40gp as number | null },
    { code: "40HC", label: "40' HC", val: r.rate40hc as number | null },
  ];
  const min = Math.min(...prices.map((p) => (typeof p.val === "number" ? p.val : Infinity)));
  const hasMin = Number.isFinite(min);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
        {/* Left */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-lg">{r.carrier ?? "Unknown Carrier"}</div>
            {hasMin && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">🔥 Cheapest available</span>
            )}
          </div>

          <div className="mt-2 grid gap-1 text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">POL:</span> {r.origin}
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">POD:</span> {r.destination}
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Transit:</span> {r.transitTime ?? "—"} <span className="ml-3 font-medium text-foreground">ETD:</span> {r.etd ?? "—"}
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Valid:</span> {r.validFrom ? new Date(r.validFrom).toISOString().slice(0, 10) : "—"} → {r.validTo ? new Date(r.validTo).toISOString().slice(0, 10) : "—"}
            </div>
          </div>
        </div>

        {/* Right prices */}
        <div className="w-full md:w-[340px]">
          <div className="grid grid-cols-3 gap-2">
            {prices.map((p) => {
              const isMin = hasMin && typeof p.val === "number" && p.val === min;
              const isSelected = baseContainer ? baseContainer === p.code : false;
              const bgClass = isSelected ? "bg-blue-50 border-blue-200" : isMin ? "bg-amber-50 border-amber-200" : "bg-gray-50";
              return (
                <div key={p.code} className={`rounded-lg border p-2 text-center ${bgClass}`}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xs text-muted-foreground">{p.label}</div>
                    {isSelected && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">Base</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{money(p.val, ccy)}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white">Get Quote</button>
            <button className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
