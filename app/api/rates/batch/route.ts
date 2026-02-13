import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const password = req.headers.get("x-delete-password");
    if (password !== "5551") {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const batchId = url.searchParams.get("batchId");
    if (!batchId) {
      return NextResponse.json(
        { ok: false, error: "Missing batchId" },
        { status: 400 }
      );
    }

    const mode = url.searchParams.get("mode");
    if (!mode || !["SEA_FCL", "SEA_LCL", "AIR"].includes(mode)) {
      return NextResponse.json(
        { ok: false, error: "Invalid mode" },
        { status: 400 }
      );
    }

    let result;
    if (mode === "SEA_FCL") {
      result = await prisma.seaFclRate.deleteMany({
        where: { batchId },
      });
    } else if (mode === "SEA_LCL") {
      result = await prisma.seaLclRate.deleteMany({
        where: { batchId },
      });
    } else {
      result = await prisma.airRate.deleteMany({
        where: { batchId },
      });
    }

    return NextResponse.json({
      ok: true,
      deletedCount: result.count,
      batchId,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to delete batch" },
      { status: 500 }
    );
  }
}
