type SP = Record<string, string | string[] | undefined>;

export default function RatesFilterBar({ searchParams }: { searchParams?: SP }) {
  const origin = typeof searchParams?.origin === "string" ? searchParams?.origin : "";
  const destination = typeof searchParams?.destination === "string" ? searchParams?.destination : "";
  const carrier = typeof searchParams?.carrier === "string" ? searchParams?.carrier : "";
  const validDate = typeof searchParams?.validDate === "string" ? searchParams?.validDate : "";
  const sort = typeof searchParams?.sort === "string" ? searchParams?.sort : "price_asc";
  const baseContainer = typeof searchParams?.baseContainer === "string" ? searchParams.baseContainer : "20GP";

  return (
    <form className="mt-6 rounded-xl border bg-white p-4 shadow-sm" method="GET">
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="text-xs text-muted-foreground">Service Type</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-gray-50"
            value="SEA_FCL"
            disabled
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Origin</label>
          <input
            name="origin"
            placeholder="Bangkok, Thailand"
            defaultValue={origin}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Destination</label>
          <input
            name="destination"
            placeholder="Shanghai, China"
            defaultValue={destination}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Carrier</label>
          <input
            name="carrier"
            placeholder="SITC"
            defaultValue={carrier}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Valid Date</label>
          <input
            name="validDate"
            type="date"
            defaultValue={validDate}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Base container</label>
          <select name="baseContainer" defaultValue={baseContainer} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="20GP">20' GP</option>
            <option value="40GP">40' GP</option>
            <option value="40HC">40' HC</option>
            <option value="20RF">20' RF</option>
            <option value="40RF">40' RF</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Sort by</label>
          <select name="sort" defaultValue={sort} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="price_asc">Price (Lowest First)</option>
            <option value="price_desc">Price (Highest First)</option>
            <option value="transit_asc">Transit (Fastest)</option>
            <option value="transit_desc">Transit (Slowest)</option>
            <option value="carrier_asc">Carrier (A-Z)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Search</button>
        </div>
      </div>
    </form>
  );
}
