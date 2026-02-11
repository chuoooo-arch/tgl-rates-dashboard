"use client";
import { useState } from "react";

export default function UploadPage() {
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");

    if (!file || !(file instanceof File) || file.size === 0) {
      setMsg("❌ กรุณาเลือกไฟล์ Excel ก่อน");
      return;
    }

    setMsg("Uploading...");

    const res = await fetch("/api/import", { method: "POST", body: fd });
    const json = await res.json();
    setMsg(JSON.stringify(json, null, 2));
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Upload Excel</h1>
      <form onSubmit={onSubmit}>
        <input name="file" type="file" accept=".xlsx,.xls" />
        <button type="submit">Import</button>
      </form>
      <pre>{msg}</pre>
    </div>
  );
}
