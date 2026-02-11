import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SP = { [k: string]: string | string[] | undefined };

const contains = (v: string) => ({ contains: v });

export default async function Dashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const params = await searchParams;
  
  const mode = (typeof params.mode === "string" ? params.mode : "SEA_FCL") as
    | "SEA_FCL"
    | "SEA_LCL"
    | "AIR";

  const origin = typeof params.origin === "string" ? params.origin.trim() : "";
  const destination = typeof params.destination === "string" ? params.destination.trim() : "";
  const carrier = typeof params.carrier === "string" ? params.carrier.trim() : "";
  const validFrom = typeof params.validFrom === "string" ? params.validFrom.trim() : ""; // yyyy-mm-dd
  const validTo = typeof params.validTo === "string" ? params.validTo.trim() : "";       // yyyy-mm-dd

  const take = 200;

  // date filter: show rows that overlap [validFrom, validTo]
  const dateWhere =
    validFrom || validTo
      ? {
          AND: [
            validTo ? { validFrom: { lte: new Date(validTo) } } : {},
            validFrom ? { validTo: { gte: new Date(validFrom) } } : {},
          ],
        }
      : {};

  const commonWhere: any = {
    ...(origin ? { origin: contains(origin) } : {}),
    ...(destination ? { destination: contains(destination) } : {}),
    ...(carrier ? { carrier: contains(carrier) } : {}),
    ...dateWhere,
  };

  let rows: any[] = [];
  if (mode === "SEA_FCL") {
    rows = await prisma.seaFclRate.findMany({
      where: commonWhere,
      orderBy: [{ origin: "asc" }, { destination: "asc" }],
      take,
    });
  } else if (mode === "SEA_LCL") {
    rows = await prisma.seaLclRate.findMany({
      where: commonWhere,
      orderBy: [{ origin: "asc" }, { destination: "asc" }],
      take,
    });
  } else {
    rows = await prisma.airRate.findMany({
      where: commonWhere,
      orderBy: [{ origin: "asc" }, { destination: "asc" }],
      take,
    });
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Rates Dashboard</h1>

      <form style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <select name="mode" defaultValue={mode}>
          <option value="SEA_FCL">SEA_FCL</option>
          <option value="SEA_LCL">SEA_LCL</option>
          <option value="AIR">AIR</option>
        </select>

        <input name="origin" placeholder="Origin" defaultValue={origin} />
        <input name="destination" placeholder="Destination" defaultValue={destination} />
        <input name="carrier" placeholder="Carrier" defaultValue={carrier} />

        <input name="validFrom" type="date" defaultValue={validFrom} />
        <input name="validTo" type="date" defaultValue={validTo} />

        <button type="submit">Search</button>
        <a href="/dashboard" style={{ alignSelf: "center" }}>
          Reset
        </a>
      </form>

      <div style={{ marginBottom: 8, opacity: 0.8 }}>
        Showing {Math.min(rows.length, take)} rows (max {take})
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 8 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {[
                "mode",
                "origin",
                "destination",
                "carrier",
                "currency",
                "validFrom",
                "validTo",
                "rate summary",
              ].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={`${mode}-${r.id}`}>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.mode ?? mode}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.origin}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.destination}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.carrier ?? ""}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.currency ?? ""}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.validFrom ? String(r.validFrom).slice(0, 10) : ""}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2" }}>{r.validTo ? String(r.validTo).slice(0, 10) : ""}</td>

                <td style={{ padding: 10, borderBottom: "1px solid #f2f2f2", whiteSpace: "nowrap" }}>
                  {mode === "SEA_FCL" && <>
                    20GP:{r.rate20gp ?? "-"} | 40GP:{r.rate40gp ?? "-"} | 40HC:{r.rate40hc ?? "-"}
                  </>}
                  {mode === "SEA_LCL" && <>
                    W/M:{r.wm ?? "-"} | Min:{r.minCharge ?? "-"} | Refund:{r.refundFreight ?? "-"}
                  </>}
                  {mode === "AIR" && <>
                    Min:{r.min ?? "-"} | +45:{r.rate45 ?? "-"} | +100:{r.rate100 ?? "-"} | +1000:{r.rate1000 ?? "-"}
                  </>}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 14, opacity: 0.7 }}>
                  No rows found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
