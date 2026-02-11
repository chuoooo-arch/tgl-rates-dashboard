import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const type = (searchParams.get("type") ?? "port").toLowerCase(); // port | airport
    const limit = Math.min(20, Math.max(5, Number(searchParams.get("limit") ?? "10")));

    if (!q) return NextResponse.json({ ok: true, items: [] });

    // Normalize query - remove extra spaces
    const normalized = q.replace(/\s+/g, ' ').trim();
    
    // Create multiple search patterns for flexible matching
    const patterns = [
      normalized,
      normalized.replace(/\s*,\s*/g, ','),  // "LAEM CHABANG, THAILAND"
      normalized.replace(/\s*,\s*/g, ' , '), // "LAEM CHABANG , THAILAND"
    ];

    // AIR -> airport
    if (type === "airport") {
      const results = await Promise.all(
        patterns.map(pattern => 
          Promise.all([
            prisma.airRate.findMany({
              where: { 
                origin: { 
                  contains: pattern
                } 
              },
              distinct: ["origin"],
              take: limit,
              select: { origin: true },
            }),
            prisma.airRate.findMany({
              where: { 
                destination: { 
                  contains: pattern
                } 
              },
              distinct: ["destination"],
              take: limit,
              select: { destination: true },
            }),
          ])
        )
      );

      const pool = results.flat(2).map((x: any) => x.origin || x.destination).filter(Boolean);
      
      const unique = Array.from(new Set(pool));
      const items = unique.slice(0, limit).map((v) => ({ value: v, label: v }));
      return NextResponse.json({ ok: true, items });
    }

    // SEA -> port (FCL + LCL)
    const results = await Promise.all(
      patterns.map(pattern =>
        Promise.all([
          prisma.seaFclRate.findMany({
            where: { origin: { contains: pattern } },
            distinct: ["origin"],
            take: limit,
            select: { origin: true },
          }),
          prisma.seaFclRate.findMany({
            where: { destination: { contains: pattern } },
            distinct: ["destination"],
            take: limit,
            select: { destination: true },
          }),
          prisma.seaLclRate.findMany({
            where: { origin: { contains: pattern } },
            distinct: ["origin"],
            take: limit,
            select: { origin: true },
          }),
          prisma.seaLclRate.findMany({
            where: { destination: { contains: pattern } },
            distinct: ["destination"],
            take: limit,
            select: { destination: true },
          }),
        ])
      )
    );

    const pool = results.flat(2).map((x: any) => x.origin || x.destination).filter(Boolean);

    const unique = Array.from(new Set(pool));
    const items = unique.slice(0, limit).map((v) => ({ value: v, label: v }));
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("lookup/locations error:", e);
    return NextResponse.json({ ok: true, items: [] });
  }
}
