import RatesClient from "./rates-client";
import UploadExcel from "@/components/UploadExcel";

type SP = Record<string, string | string[] | undefined>;

export default async function RatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const mode = typeof sp.mode === "string" ? sp.mode : "SEA_FCL";
  const origin = typeof sp.origin === "string" ? sp.origin : "";
  const destination = typeof sp.destination === "string" ? sp.destination : "";
  const carrier = typeof sp.carrier === "string" ? sp.carrier : "";
  const validFrom = typeof sp.validFrom === "string" ? sp.validFrom : "";
  const validTo = typeof sp.validTo === "string" ? sp.validTo : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Logo */}
      <div className="bg-white dark:bg-slate-800 shadow-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start gap-4">
          <img 
            src="https://i.postimg.cc/0y9MR7ZP/18951019_262123810923637_4178233151248642491_n.jpg" 
            alt="Thai Global Logistics" 
            className="h-14 w-14 rounded-lg object-cover shadow-md flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TGL FreightIntel
            </h1>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Smart Freight Rate Intelligence Platform
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Powered by Thai Global Logistics
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Upload Section */}
        <UploadExcel />

        {/* Rates Table */}
        <RatesClient
          initial={{
            mode,
            origin,
            destination,
            carrier,
            validFrom,
            validTo,
          }}
        />
      </div>
    </div>
  );
}
