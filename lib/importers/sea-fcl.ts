import type { Importer } from "./types";
import {
  findSheetWithHeader,
  aoaToObjects,
  pick,
  toNumber,
  toDate,
  makeFingerprint,
} from "./utils";
import { insertIgnoreDuplicates } from "./db";

export const seaFclImporter: Importer = {
  id: "seaFcl",
  match(headers) {
    const h = headers.map((x) => x.toLowerCase());
    const score =
      (h.includes("origin") ? 2 : 0) +
      (h.includes("destination") ? 2 : 0) +
      (h.includes("rate_20gp") ? 3 : 0) +
      (h.includes("rate_40gp") ? 3 : 0) +
      (h.includes("rate_40hc") ? 3 : 0);
    return score;
  },
  async run({ prisma, wb }) {
    const found = findSheetWithHeader(wb, ["origin", "destination", "rate_20gp"]);
    if (!found) throw new Error("SEA_FCL: หา header ไม่เจอ");
    const { sheetName, aoa, headerRowIndex } = found;
    const { rows } = aoaToObjects(aoa, headerRowIndex);

    const data = rows
      .map((r) => {
        const origin = String(pick(r, ["origin"]) ?? "").trim();
        const destination = String(pick(r, ["destination"]) ?? "").trim();
        if (!origin || !destination) return null;

        // normalize optional fields BEFORE using in fingerprint
        const carrierN = String(pick(r, ["carrier"]) ?? "").trim();
        const currencyN = String(pick(r, ["currency"]) ?? "USD").trim();
        const transitTimeN = String(pick(r, ["transit_time", "transitTime"]) ?? "").trim();
        const etdN = String(pick(r, ["etd"]) ?? "").trim();
        const agencyN = String(pick(r, ["agency"]) ?? "").trim();

        const validFrom = toDate(pick(r, ["valid_from", "validFrom"]));
        const validTo = toDate(pick(r, ["valid_to", "validTo"]));

        const rate20gp = toNumber(pick(r, ["rate_20gp"]));
        const rate40gp = toNumber(pick(r, ["rate_40gp"]));
        const rate40hc = toNumber(pick(r, ["rate_40hc"]));
        const rate20rf = toNumber(pick(r, ["rate_20_rf", "rate_20rf"]));
        const rate40rf = toNumber(pick(r, ["rate_40_rf", "rate_40rf"]));

        return {
          mode: "SEA_FCL",
          origin,
          destination,

          rate20gp,
          rate40gp,
          rate40hc,
          rate20rf,
          rate40rf,

          carrier: carrierN || null,
          currency: currencyN || null,
          validFrom,
          validTo,
          transitTime: transitTimeN || null,
          etd: etdN || null,
          agency: agencyN || null,

          fingerprint: makeFingerprint([
            "SEA_FCL",
            origin,
            destination,
            carrierN,
            currencyN,
            validFrom?.toISOString()?.slice(0, 10),
            validTo?.toISOString()?.slice(0, 10),
            rate20gp,
            rate40gp,
            rate40hc,
            rate20rf,
            rate40rf,
            transitTimeN,
            etdN,
            agencyN,
          ]),
        };
      })
      .filter(Boolean);

    const { inserted, skipped } = await insertIgnoreDuplicates<any>(data as any[], 
      (row) => prisma.seaFclRate.create({ data: row }),
      (rows) => prisma.seaFclRate.createMany({ data: rows, skipDuplicates: true })
    );

    return { importer: "seaFcl", sheet: sheetName, totalRows: rows.length, inserted, skipped };
  },
};
