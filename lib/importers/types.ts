export type ImportResult = {
  importer: string;
  sheet: string;
  totalRows: number;
  inserted: number;
};

export type WorkbookLike = {
  SheetNames: string[];
  Sheets: Record<string, any>;
};

export type Importer = {
  id: string;
  // ให้คะแนนความ "ใช่" จาก headers (0 = ไม่ใช่)
  match: (headers: string[]) => number;
  // parse+insert
  run: (args: {
    prisma: any;
    wb: WorkbookLike;
    batchId?: string;
  }) => Promise<ImportResult>;
};


