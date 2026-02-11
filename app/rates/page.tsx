import RatesClient from "./rates-client";

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
  );
}
