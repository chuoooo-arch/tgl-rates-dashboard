import { Prisma } from "@prisma/client";

export async function insertIgnoreDuplicates<T>(
  rows: T[],
  createOne: (row: T) => Promise<unknown>,
  createMany?: (rows: T[]) => Promise<any>
) {
  // ถ้าไม่มีแถว ให้ return ทันที
  if (!rows || rows.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  // ถ้ามี createMany และจำนวนแถวเยอะให้ลองใช้ batch แล้ว fallback เป็น loop
  if (createMany && rows.length > 10) {
    try {
      const result = await createMany(rows);
      // Prisma createMany กับ skipDuplicates ไม่บอก skipped count ให้ assume inserted = count
      return { inserted: result.count ?? rows.length, skipped: 0 };
    } catch (e: any) {
      // ถ้า batch เพื่ง error (เช่น type mismatch) ให้ fallback เป็น loop
      console.warn("[DB] Batch insert failed, falling back to loop:", e?.message);
    }
  }

  // Fallback: loop ทีละแถว
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await createOne(row);
      inserted++;
    } catch (e: any) {
      // Unique constraint violation (เช่น fingerprint @unique)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        skipped++;
        continue;
      }
      throw e;
    }
  }

  return { inserted, skipped };
}
