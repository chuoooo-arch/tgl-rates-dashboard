import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readWorkbook } from "@/lib/importers/utils";
import { runImport } from "@/lib/importers";

const log = (...args: any[]) => console.log("[IMPORT]", ...args);

export async function POST(req: Request) {
  const started = Date.now();

  try {
    const fd = await req.formData();
    const file = fd.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = readWorkbook(buffer);

    const result = await runImport({ prisma, wb });

    log("OK", {
      filename: (file as File).name,
      size: (file as File).size,
      importer: result.importer,
      sheet: result.sheet,
      totalRows: result.totalRows,
      inserted: result.inserted,
      ms: Date.now() - started,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    log("ERR", e?.message, { ms: Date.now() - started });
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}


