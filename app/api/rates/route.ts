import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") || "SEA_FCL";
    const origin = request.nextUrl.searchParams.get("origin") || "";
    const destination = request.nextUrl.searchParams.get("destination") || "";
    const carrier = request.nextUrl.searchParams.get("carrier") || "";
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(request.nextUrl.searchParams.get("pageSize") || "10", 10);
    
    // TODO: Implement rates filtering
    const items: any[] = [];
    const total = 0;
    
    return NextResponse.json({
      ok: true,
      items,
      total,
      page,
      pageSize
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
