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

export const seaLclImporter: Importer = {
  id: "seaLcl",
  match(headers) {
    const h = headers.map((x) => x.toLowerCase());
    const score =
      (h.includes("origin_port_code") ? 3 : 0) +
      (h.includes("destination_port_code") ? 3 : 0) +
      (h.includes("w_m") ? 2 : 0) +
      (h.includes("min_charge") ? 2 : 0) +
      (h.includes("refund_freight") ? 2 : 0);
    return score;
  },
  async run({ prisma, wb }) {
    const found = findSheetWithHeader(wb, ["origin_port_code", "destination_port_code"]);
    if (!found) throw new Error("SEA_LCL: หา header ไม่เจอ");
    const { sheetName, aoa, headerRowIndex } = found;
    const { rows, headers } = aoaToObjects(aoa, headerRowIndex);

    // guard against AIR misdetection
    const h = headers.map((x) => x.toLowerCase());
    if (h.includes("+45") || h.includes("+100") || h.includes("+1000")) {
      throw new Error("SEA_LCL: header detected as AIR (has +45/+100/+1000)");
    }

    const data = rows
      .map((r) => {
        const origin = String(pick(r, ["origin_port_code"]) ?? "").trim();
        const destination = String(pick(r, ["destination_port_code"]) ?? "").trim();
        if (!origin || !destination) return null;

        // normalize optional fields BEFORE using in fingerprint
        const carrierN = String(pick(r, ["carrier"]) ?? "").trim();
        const currencyN = String(pick(r, ["currency"]) ?? "USD").trim();
        const transitTimeN = String(pick(r, ["transit_time", "transitTime"]) ?? "").trim();
        const agencyN = String(pick(r, ["agency"]) ?? "").trim();

        const validFrom = toDate(pick(r, ["valid_from", "validFrom"]));
        const validTo = toDate(pick(r, ["valid_to", "validTo"]));

        const wm = toNumber(pick(r, ["w_m", "wm"]));
        const minCharge = toNumber(pick(r, ["min_charge", "mincharge"]));
        const refundFreight = toNumber(pick(r, ["refund_freight", "refundfreight"]));

        return {
          mode: "SEA_LCL",
          origin,
          destination,

          wm,
          minCharge,
          refundFreight,

          carrier: carrierN || null,
          currency: currencyN || null,
          validFrom,
          validTo,
          transitTime: transitTimeN || null,
          agency: agencyN || null,

          fingerprint: makeFingerprint([
            "SEA_LCL",
            origin,
            destination,
            carrierN,
            currencyN,
            validFrom?.toISOString()?.slice(0, 10),
            validTo?.toISOString()?.slice(0, 10),
            wm,
            minCharge,
            refundFreight,
            transitTimeN,
            agencyN,
          ]),
        };
      })
      .filter(Boolean);

    const { inserted, skipped } = await insertIgnoreDuplicates<any>(data as any[],
      (row) => prisma.seaLclRate.create({ data: row }),
      (rows) => prisma.seaLclRate.createMany({ data: rows, skipDuplicates: true })
    );

    return { importer: "seaLcl", sheet: sheetName, totalRows: rows.length, inserted, skipped };
  },
};
