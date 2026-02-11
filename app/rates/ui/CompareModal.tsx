"use client";

function money(v: any, ccy: string) {
  if (typeof v !== "number") return "—";
  return `${ccy} ${Number(v).toLocaleString()}`;
}

export default function CompareModal({
  open,
  onClose,
  mode,
  items,
}: {
  open: boolean;
  onClose: () => void;
  mode: "SEA_LCL" | "AIR" | "SEA_FCL";
  items: any[];
}) {
  if (!open) return null;

  // helper: highlight best (min)
  const minNum = (vals: any[]) => Math.min(...vals.map((x) => (typeof x === "number" ? x : Infinity)));

  const ccy = items?.[0]?.currency ?? "USD";

  // SEA_LCL fields
  const wmVals = items.map((x) => x.wm);
  const refundVals = items.map((x) => x.refundFreight);
  const netVals = items.map((x) => {
    const wm = typeof x.wm === "number" ? x.wm : null;
    const minc = typeof x.minCharge === "number" ? x.minCharge : null;
    const base = wm ?? minc;
    const refund = typeof x.refundFreight === "number" ? x.refundFreight : 0; // refund ติดลบ
    return base === null ? null : base + refund;
  });

  const bestWm = minNum(wmVals);
  const bestNet = minNum(netVals);

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="font-semibold">Compare — {mode}</div>
          <button className="rounded-md px-3 py-2 border" onClick={onClose}>Close</button>
        </div>

        <div className="p-5 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="text-sm text-gray-500">Field</div>
            {items.map((x, idx) => (
              <div key={idx} className="text-sm font-semibold">
                {x.carrier ?? "—"}
                <div className="text-xs text-gray-500 font-normal">
                  {x.origin} → {x.destination}
                </div>
              </div>
            ))}

            {/* Transit */}
            <div className="text-sm text-gray-500">Transit</div>
            {items.map((x, idx) => (
              <div key={idx} className="text-sm">{x.transitTime ?? "—"}</div>
            ))}

            {/* SEA_LCL rows */}
            {mode === "SEA_LCL" && (
              <>
                <div className="text-sm text-gray-500">W/M</div>
                {items.map((x, idx) => {
                  const v = x.wm;
                  const isBest = typeof v === "number" && v === bestWm;
                  return (
                    <div key={idx} className={`text-sm rounded-md px-2 py-1 ${isBest ? "bg-amber-50 border border-amber-200" : ""}`}>
                      {money(v, ccy)}
                    </div>
                  );
                })}

                <div className="text-sm text-gray-500">Refund</div>
                {items.map((x, idx) => (
                  <div key={idx} className="text-sm">{money(x.refundFreight, ccy)}</div>
                ))}

                <div className="text-sm text-gray-500 font-semibold">Net Cost</div>
                {items.map((x, idx) => {
                  const base = (typeof x.wm === "number" ? x.wm : (typeof x.minCharge === "number" ? x.minCharge : null));
                  const net = base === null ? null : base + (typeof x.refundFreight === "number" ? x.refundFreight : 0);
                  const isBest = typeof net === "number" && net === bestNet;
                  return (
                    <div key={idx} className={`text-sm font-semibold rounded-md px-2 py-1 ${isBest ? "bg-amber-50 border border-amber-200" : ""}`}>
                      {money(net, ccy)} {isBest ? " 🔥" : ""}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
