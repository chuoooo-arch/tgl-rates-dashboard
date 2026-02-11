import * as XLSX from "xlsx";
import crypto from "crypto";

export const norm = (s: any) => String(s ?? "").trim().toLowerCase();

export const toNumber = (v: any): number | null => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/,/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

export const toDate = (v: any): Date | null => {
  if (v == null || v === "") return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;

  // excel serial date
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return new Date(Date.UTC(d.y, d.m - 1, d.d));
  }

  const d2 = new Date(String(v));
  return isNaN(d2.getTime()) ? null : d2;
};

export const parseExcelDate = (v: any): Date | null => toDate(v);

export const makeFingerprint = (parts: any[]) =>
  crypto
    .createHash("sha1")
    .update(parts.map((v) => String(v ?? "").trim()).join("|"))
    .digest("hex");

export const readWorkbook = (buffer: Buffer) => XLSX.read(buffer, { type: "buffer" });

export const sheetToAOA = (sheet: any) =>
  XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][];

export const findHeaderRow = (aoa: any[][], required: string[]) => {
  const req = required.map((x) => norm(x));
  return aoa.findIndex((row) => {
    const cells = row.map(norm);
    return req.every((r) => cells.includes(r));
  });
};

export const aoaToObjects = (aoa: any[][], headerRowIndex: number) => {
  const headers = aoa[headerRowIndex].map((h) => String(h ?? "").trim());
  const rows = aoa.slice(headerRowIndex + 1).map((r) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
  return { headers, rows };
};

// ดึงค่าจากหลายชื่อคีย์ + ไม่สนตัวใหญ่เล็ก
export const pick = (r: any, keys: string[]) => {
  for (const k of keys) {
    const v = r[k] ?? r[k.toUpperCase()] ?? r[k.toLowerCase()];
    if (v != null && String(v).trim() !== "") return v;
  }
  return null;
};

// ลองทุกชีท แล้วคืนชีทแรกที่ "เจอ header required"
export const findSheetWithHeader = (wb: any, required: string[]) => {
  for (const name of wb.SheetNames) {
    const aoa = sheetToAOA(wb.Sheets[name]);
    const idx = findHeaderRow(aoa, required);
    if (idx !== -1) return { sheetName: name, aoa, headerRowIndex: idx };
  }
  return null;
};
