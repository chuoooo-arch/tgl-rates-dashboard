import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const type = (searchParams.get("type") ?? "carrier").toLowerCase(); // carrier | agent
    const limit = Math.min(20, Math.max(5, Number(searchParams.get("limit") ?? "10")));

    if (!q) return NextResponse.json({ ok: true, items: [] });

    // Normalize query
    const normalized = q.replace(/\s+/g, ' ').trim();
    
    // Create multiple search patterns
    const patterns = [
      normalized,
      normalized.replace(/\s*,\s*/g, ','),
      normalized.replace(/\s*,\s*/g, ' , '),
    ];

    if (type === "agent") {
      const results = await Promise.all(
        patterns.map(pattern =>
          Promise.all([
            prisma.seaFclRate.findMany({
              where: { agency: { contains: pattern } },
              distinct: ["agency"],
              take: limit,
              select: { agency: true },
            }),
            prisma.seaLclRate.findMany({
              where: { agency: { contains: pattern } },
              distinct: ["agency"],
              take: limit,
              select: { agency: true },
            }),
            prisma.airRate.findMany({
              where: { agency: { contains: pattern } },
              distinct: ["agency"],
              take: limit,
              select: { agency: true },
            }),
          ])
        )
      );

      const pool = results.flat(2).map((x: any) => x.agency).filter(Boolean);
      
      const unique = Array.from(new Set(pool));
      const items = unique.slice(0, limit).map((v) => ({ value: v, label: v }));
      return NextResponse.json({ ok: true, items });
    }

    // carrier (sea + air)
    const results = await Promise.all(
      patterns.map(pattern =>
        Promise.all([
          prisma.seaFclRate.findMany({
            where: { carrier: { contains: pattern } },
            distinct: ["carrier"],
            take: limit,
            select: { carrier: true },
          }),
          prisma.seaLclRate.findMany({
            where: { carrier: { contains: pattern } },
            distinct: ["carrier"],
            take: limit,
            select: { carrier: true },
          }),
          prisma.airRate.findMany({
            where: { carrier: { contains: pattern } },
            distinct: ["carrier"],
            take: limit,
            select: { carrier: true },
          }),
        ])
      )
    );

    const pool = results.flat(2).map((x: any) => x.carrier).filter(Boolean);

    const unique = Array.from(new Set(pool));
    const items = unique.slice(0, limit).map((v) => ({ value: v, label: v }));
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("lookup/partners error:", e);
    return NextResponse.json({ ok: true, items: [] });
  }
}
