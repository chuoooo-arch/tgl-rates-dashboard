import RatesFilterBar from "./ui/RatesFilterBar";
import RateCardFcl from "./ui/RateCardFcl";

type SP = Record<string, string | string[] | undefined>;

async function fetchRates(searchParams: SP) {
  const qs = new URLSearchParams();
  qs.set("mode", "SEA_FCL");
  const origin = typeof searchParams.origin === "string" ? searchParams.origin : "";
  const destination = typeof searchParams.destination === "string" ? searchParams.destination : "";
  const carrier = typeof searchParams.carrier === "string" ? searchParams.carrier : "";
  const validDate = typeof searchParams.validDate === "string" ? searchParams.validDate : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "price_asc";
  const baseContainer = typeof searchParams.baseContainer === "string" ? searchParams.baseContainer : "20GP";
  const page = typeof searchParams.page === "string" ? searchParams.page : "1";
  if (origin) qs.set("origin", origin);
  if (destination) qs.set("destination", destination);
  if (carrier) qs.set("carrier", carrier);
  if (validDate) qs.set("validDate", validDate);
  if (sort) qs.set("sort", sort);
  if (baseContainer) qs.set("baseContainer", baseContainer);
  if (page) qs.set("page", page);
  qs.set("pageSize", "10");
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = `${baseUrl}/api/rates?${qs.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    return res.json();
  } catch (e) {
    return { ok: false, error: "Failed to fetch" };
  }
}

export default async function RatesPage({ searchParams }: { searchParams: SP }) {
  const data = await fetchRates(searchParams);
  const baseContainer = typeof searchParams.baseContainer === "string" ? searchParams.baseContainer : "20GP";
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px", letterSpacing: "-0.02em" }}>
          TGL FreightIntel
        </h1>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Smart Freight Rate Intelligence Platform
        </p>
      </div>
      <RatesFilterBar searchParams={searchParams} />
      {!data?.ok ? (
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #fcc", borderRadius: "8px", color: "#c00" }}>
          Error: {data?.error ?? "Unknown"}
        </div>
      ) : (
        <>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Found <span style={{ fontWeight: "700", color: "#111" }}>{data.total}</span> results
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.items?.length ? (
              data.items.map((r: any) => <RateCardFcl key={r.id} r={r} baseContainer={baseContainer} />)
            ) : (
              <div style={{ marginTop: "16px", padding: "24px", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px", color: "#999" }}>
                No results
              </div>
            )}
          </div>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={searchParams} />
          </div>
        </>
      )}
    </div>
  );
}

function Pagination({ total, page, pageSize, searchParams }: { total: number; page: number; pageSize: number; searchParams: SP }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (typeof searchParams.origin === "string" && searchParams.origin) params.set("origin", searchParams.origin);
    if (typeof searchParams.destination === "string" && searchParams.destination) params.set("destination", searchParams.destination);
    if (typeof searchParams.carrier === "string" && searchParams.carrier) params.set("carrier", searchParams.carrier);
    if (typeof searchParams.validDate === "string" && searchParams.validDate) params.set("validDate", searchParams.validDate);
    if (typeof searchParams.sort === "string" && searchParams.sort) params.set("sort", searchParams.sort);
    if (typeof searchParams.baseContainer === "string" && searchParams.baseContainer) params.set("baseContainer", searchParams.baseContainer);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <a href={buildUrl(prev)} style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", textDecoration: "none", color: "#111", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>
        ← Prev
      </a>
      <div style={{ fontSize: "13px", color: "#666" }}>Page {page} / {totalPages}</div>
      <a href={buildUrl(next)} style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", textDecoration: "none", color: "#111", fontSize: "13px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>
        Next →
      </a>
    </div>
  );
}
