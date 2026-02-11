import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Mode = "SEA_FCL" | "SEA_LCL" | "AIR";
type Sort = "price_asc" | "price_desc" | "transit_asc" | "transit_desc" | "name_asc";

const FCL_BASE = {
  "20GP": "rate20gp",
  "40GP": "rate40gp",
  "40HC": "rate40hc",
  "20RF": "rate20rf",
  "40RF": "rate40rf",
} as const;

const LCL_BASE = {
  "NET": "__net__",
  "WM": "wm",
  "MIN": "minCharge",
  "REFUND": "refundFreight",
} as const;

const AIR_BASE = {
  "MIN": "min",
  "R45": "rate45",
  "R100": "rate100",
  "R300": "rate300",
  "R500": "rate500",
  "R1000": "rate1000",
  "S1000": "surcharge1000",
} as const;

function norm(s?: string | null) {
  return (s ?? "").trim();
}

function toUpper(s: string) {
  return s.toUpperCase();
}

function parseDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Extract first number from transitTime (e.g., "15-18" -> 15, "6" -> 6, "40-45" -> 40)
function transitKey(s?: string | null) {
  const t = norm(s);
  if (!t) return Number.POSITIVE_INFINITY;
  const m = t.match(/(\d+)(?:\s*-\s*(\d+))?/);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function tierFromWeight(weightKg: number) {
  if (weightKg <= 45) return "rate45";
  if (weightKg <= 100) return "rate100";
  if (weightKg <= 300) return "rate300";
  if (weightKg <= 500) return "rate500";
  return "rate1000";
}

function compareNullable(a: number | null, b: number | null, asc: boolean) {
  const aInvalid = a == null;
  const bInvalid = b == null;
  if (aInvalid && bInvalid) return 0;
  if (aInvalid) return 1;
  if (bInvalid) return -1;
  if (a === b) return 0;
  return asc ? a - b : b - a;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = (toUpper(norm(url.searchParams.get("mode"))) || "SEA_FCL") as Mode;
    const origin = norm(url.searchParams.get("origin")) || "";
    const destination = norm(url.searchParams.get("destination")) || "";
    const carrier = norm(url.searchParams.get("carrier")) || "";
    const validFrom = parseDate(url.searchParams.get("validFrom"));
    const validTo = parseDate(url.searchParams.get("validTo"));
    const sort = (url.searchParams.get("sort") as Sort) || "price_asc";
    const baseParam = url.searchParams.get("base") ?? url.searchParams.get("baseContainer");
    const base = toUpper(norm(baseParam)) || (
      mode === "SEA_FCL" ? "20GP" : mode === "SEA_LCL" ? "NET" : "R100"
    );

    const weight = Number(url.searchParams.get("weight") || "0");
    const take = Math.min(50, Math.max(5, Number(url.searchParams.get("take") || "20")));
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const skip = (page - 1) * take;

    // Build where clause for Prisma query
    const where: any = {
      ...(origin ? { origin: { contains: origin } } : {}),
      ...(destination ? { destination: { contains: destination } } : {}),
      ...(carrier ? { carrier: { contains: carrier } } : {}),
      ...(validFrom || validTo
        ? {
            AND: [
              // rate.validTo >= filter.validFrom (ถ้ามี)
              ...(validFrom
                ? [{ OR: [{ validTo: null }, { validTo: { gte: validFrom } }] }]
                : []),
              // rate.validFrom <= filter.validTo (ถ้ามี)
              ...(validTo
                ? [{ OR: [{ validFrom: null }, { validFrom: { lte: validTo } }] }]
                : []),
            ],
          }
        : {}),
    };

    // Handle different modes separately so we can use DB-side orderBy where possible
    if (mode === "SEA_LCL") {
      const baseField = (LCL_BASE as any)[base] ?? "__net__";
      const raw = await prisma.seaLclRate.findMany({ where: { mode: "SEA_LCL", ...where }, take: 2000, orderBy: [{ createdAt: "desc" }] });

      const rows = raw.map((r: any) => {
        const wm = typeof r.wm === "number" ? r.wm : null;
        const minCharge = typeof r.minCharge === "number" ? r.minCharge : null;
        const refund = typeof r.refundFreight === "number" ? r.refundFreight : null;

        const baseCost = wm ?? minCharge ?? null;
        const netCost = baseCost == null ? null : baseCost + (refund ?? 0);

        let sortPrice: number | null = null;
        if (baseField === "__net__") sortPrice = netCost;
        else sortPrice = (r as any)[baseField] ?? null;

        return {
          ...r,
          netCost,
          _sortPrice: sortPrice,
          _transit: transitKey(r.transitTime),
        };
      });

      rows.sort((a: any, b: any) => {
        if (sort === "name_asc") return String(a.carrier ?? "").localeCompare(String(b.carrier ?? ""));
        if (sort === "transit_asc") return a._transit - b._transit;
        if (sort === "transit_desc") return b._transit - a._transit;

        const isNet = baseField === "__net__";
        const ax = isNet && a._sortPrice != null && a._sortPrice <= 0 ? null : a._sortPrice;
        const bx = isNet && b._sortPrice != null && b._sortPrice <= 0 ? null : b._sortPrice;
        return compareNullable(ax, bx, sort !== "price_desc");
      });

      const total = rows.length;
      const items = rows.slice(skip, skip + take).map(({ _sortPrice, _transit, ...rest }: any) => rest);
      return NextResponse.json({ ok: true, mode, base, sort, page, take, total, items });
    }

    if (mode === "AIR") {
      const tierField = weight > 0 ? tierFromWeight(weight) : ((AIR_BASE as any)[base] ?? "rate100");
      const raw = await prisma.airRate.findMany({ where: { mode: "AIR", ...where }, take: 2000, orderBy: [{ createdAt: "desc" }] });

      const rows = raw.map((r: any) => {
        const main = (r as any)[tierField] ?? null;
        const s1000 = typeof r.surcharge1000 === "number" ? r.surcharge1000 : 0;
        const priceAtTier = weight > 1000 && main != null ? main + s1000 : main;

        return {
          ...r,
          _sortPrice: priceAtTier,
          _transit: transitKey(r.transitTime),
        };
      });

      rows.sort((a: any, b: any) => {
        if (sort === "name_asc") return String(a.carrier ?? "").localeCompare(String(b.carrier ?? ""));
        if (sort === "transit_asc") return a._transit - b._transit;
        if (sort === "transit_desc") return b._transit - a._transit;

        return compareNullable(a._sortPrice ?? null, b._sortPrice ?? null, sort !== "price_desc");
      });

      const total = rows.length;
      const items = rows.slice(skip, skip + take).map(({ _sortPrice, _transit, ...rest }: any) => rest);
      return NextResponse.json({ ok: true, mode, base, sort, weight, tierField, page, take, total, items });
    }

    // Default: SEA_FCL handling (in-memory min-of-multiple) — cap at 2000 to avoid large memory
    // Map container codes to fields
    const containerFieldMap: Record<string, string> = {
      "20GP": "rate20gp",
      "40GP": "rate40gp",
      "40HC": "rate40hc",
      "20RF": "rate20rf",
      "40RF": "rate40rf",
    };

    // Fetch data (cap at 2000 to avoid too large datasets)
    const raw = await prisma.seaFclRate.findMany({ where: { mode: "SEA_FCL", ...where }, take: 2000 });

    // Transform and calculate effective price
    const rows = raw.map((r) => {
      const p20 = r.rate20gp ?? null;
      const p40 = r.rate40gp ?? null;
      const p40hc = r.rate40hc ?? null;
      const p20rf = (r as any).rate20rf ?? null;
      const p40rf = (r as any).rate40rf ?? null;

      const candidates = [p20, p40, p40hc, p20rf, p40rf].filter((x): x is number => typeof x === "number");

      // Determine effective price as min of available rates (used as fallback)
      const effectivePrice = candidates.length ? Math.min(...candidates) : null;

      return {
        id: r.id,
        mode: r.mode,
        origin: r.origin,
        destination: r.destination,
        carrier: r.carrier,
        currency: r.currency ?? "USD",
        validFrom: r.validFrom,
        validTo: r.validTo,
        transitTime: r.transitTime,
        etd: r.etd,
        agency: r.agency,

        rate20gp: p20,
        rate40gp: p40,
        rate40hc: p40hc,
        rate20rf: p20rf,
        rate40rf: p40rf,
        effectivePrice,
        transitKey: transitKey(r.transitTime),
      };
    });

    // Sorting: if price sort requested, sort by the selected container field (push nulls to end).
    const priceSortRequested = sort === "price_asc" || sort === "price_desc";
    const priceField = containerFieldMap[base] ?? "rate20gp";

    rows.sort((a: any, b: any) => {
      if (sort === "name_asc") return (a.carrier ?? "").localeCompare(b.carrier ?? "");
      if (sort === "transit_asc") return a.transitKey - b.transitKey;
      if (sort === "transit_desc") return b.transitKey - a.transitKey;

      if (priceSortRequested) {
        const priceA = (a as any)[priceField] ?? Number.MAX_SAFE_INTEGER;
        const priceB = (b as any)[priceField] ?? Number.MAX_SAFE_INTEGER;

        if (priceA === priceB) {
          // if both have no selected-container price, fallback to effectivePrice
          const ea = a.effectivePrice ?? Number.POSITIVE_INFINITY;
          const eb = b.effectivePrice ?? Number.POSITIVE_INFINITY;
          return ea - eb;
        }
        return sort === "price_desc" ? priceB - priceA : priceA - priceB;
      }

      // default fallback (shouldn't happen)
      const ax = a.effectivePrice ?? Number.POSITIVE_INFINITY;
      const bx = b.effectivePrice ?? Number.POSITIVE_INFINITY;
      return ax - bx;
    });

    // Paginate
    const total = rows.length;
    const paged = rows.slice(skip, skip + take).map(({ transitKey, ...rest }) => rest);

    return NextResponse.json({
      ok: true,
      mode,
      sort,
      page,
      take,
      total,
      items: paged,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
