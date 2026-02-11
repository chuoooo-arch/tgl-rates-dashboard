import UploadExcel from "@/components/UploadExcel";

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Upload Excel File</h1>
      <p className="mb-6 text-gray-500">
        Import rate data from Excel files (AIR, SEA FCL, SEA LCL)
      </p>

      <UploadExcel />
    </main>
  );
}
