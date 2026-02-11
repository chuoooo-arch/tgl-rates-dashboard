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

export const airImporter: Importer = {
  id: "air",
  match(headers) {
    const h = headers.map((x) => x.toLowerCase());
    const score =
      (h.includes("origin_port_code") ? 2 : 0) +
      (h.includes("destination_port_code") ? 2 : 0) +
      (h.includes("+45") ? 2 : 0) +
      (h.includes("+100") ? 2 : 0) +
      (h.includes("+1000") ? 2 : 0) +
      (h.includes("min") ? 1 : 0);
    return score;
  },

  async run({ prisma, wb }) {
    const found = findSheetWithHeader(wb, ["origin_port_code", "destination_port_code"]);
    if (!found) throw new Error("AIR: หา header ไม่เจอ");

    const { sheetName, aoa, headerRowIndex } = found;
    const { rows } = aoaToObjects(aoa, headerRowIndex);

    const data = rows
      .map((r) => {
        const origin = String(pick(r, ["origin_port_code", "origin"]) ?? "").trim();
        const destination = String(pick(r, ["destination_port_code", "destination"]) ?? "").trim();
        if (!origin || !destination) return null;

        // normalize optional fields BEFORE using in fingerprint
        const carrierN = String(pick(r, ["carrier"]) ?? "").trim();
        const currencyN = String(pick(r, ["currency"]) ?? "USD").trim();
        const etdN = String(pick(r, ["etd"]) ?? "").trim();
        const agencyN = String(pick(r, ["agency"]) ?? "").trim();

        const validFrom = toDate(pick(r, ["valid_from", "validFrom"]));
        const validTo = toDate(pick(r, ["valid_to", "validTo"]));

        const min = toNumber(pick(r, ["min"]));
        const rate45 = toNumber(pick(r, ["+45", "45"]));
        const rate100 = toNumber(pick(r, ["+100", "100"]));
        const rate300 = toNumber(pick(r, ["+300", "300"]));
        const rate500 = toNumber(pick(r, ["+500", "500"]));
        const rate1000 = toNumber(pick(r, ["+1000", "1000"]));
        const surcharge1000 = toNumber(pick(r, ["surcharge_1000", "surcharge1000"]));

        return {
          mode: "AIR",
          origin,
          destination,

          min,
          rate45,
          rate100,
          rate300,
          rate500,
          rate1000,
          surcharge1000,

          carrier: carrierN || null,
          currency: currencyN || null,
          validFrom,
          validTo,
          etd: etdN || null,
          agency: agencyN || null,

          fingerprint: makeFingerprint([
            "AIR",
            origin,
            destination,
            carrierN,
            currencyN,
            validFrom?.toISOString()?.slice(0, 10),
            validTo?.toISOString()?.slice(0, 10),
            min,
            rate45,
            rate100,
            rate300,
            rate500,
            rate1000,
            surcharge1000,
            etdN,
            agencyN,
          ]),
        };
      })
      .filter(Boolean);

    const { inserted, skipped } = await insertIgnoreDuplicates<any>(data as any[],
      (row) => prisma.airRate.create({ data: row }),
      (rows) => prisma.airRate.createMany({ data: rows, skipDuplicates: true })
    );

    return { importer: "air", sheet: sheetName, totalRows: rows.length, inserted, skipped };
  },
};
