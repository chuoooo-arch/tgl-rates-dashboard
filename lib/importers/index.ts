import type { Importer, ImportResult } from "./types";
import { airImporter } from "./air";
import { seaFclImporter } from "./sea-fcl";
import { seaLclImporter } from "./sea-lcl";
import { sheetToAOA } from "./utils";

const importers: Importer[] = [seaFclImporter, seaLclImporter, airImporter];

export const runImport = async (args: {
  prisma: any;
  wb: any;
  batchId?: string;
}): Promise<ImportResult> => {
  // Scan all sheets and first 30 rows to find the best matching header row
  let best: { importer: Importer; sheetName: string; headerRowIndex: number; score: number } | null =
    null;

  for (const sheetName of args.wb.SheetNames) {
    const aoa = sheetToAOA(args.wb.Sheets[sheetName]);

    for (let i = 0; i < Math.min(30, aoa.length); i++) {
      const headers = (aoa[i] ?? [])
        .map((x: any) => String(x ?? "").trim())
        .filter((x: string) => x.length > 0);

      if (headers.length < 2) continue;

      // Score this header row against all importers
      for (const importer of importers) {
        const score = importer.match(headers);
        if (!best || score > best.score) {
          best = { importer, sheetName, headerRowIndex: i, score };
        }
      }
    }
  }

  if (!best || best.score <= 0) {
    throw new Error(`No importer matched across all sheets and header rows`);
  }

  // Run the best matching importer (which will do its own sheet/header detection)
  return best.importer.run({ prisma: args.prisma, wb: args.wb, batchId: args.batchId });
};
