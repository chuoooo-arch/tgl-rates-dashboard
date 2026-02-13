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
    const id = parseInt(url.pathname.split("/").pop() || "0", 10);
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Invalid rate ID" },
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

    let deleted;
    if (mode === "SEA_FCL") {
      deleted = await prisma.seaFclRate.delete({ where: { id } });
    } else if (mode === "SEA_LCL") {
      deleted = await prisma.seaLclRate.delete({ where: { id } });
    } else {
      deleted = await prisma.airRate.delete({ where: { id } });
    }

    return NextResponse.json({
      ok: true,
      deleted,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to delete rate" },
      { status: 500 }
    );
  }
}
