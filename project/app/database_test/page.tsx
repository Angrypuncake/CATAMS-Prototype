// app/test/page.tsx   (example route: http://localhost:3000/test)

// Import your Supabase server client factory
import { createClient } from "@/lib/supabase/server";

// Async Server Component (runs only on server, can safely call Supabase)
export default async function DbTest() {
  // 1. Create a fresh Supabase client for this request (includes cookies/session)
  const supabase = await createClient();

  // 2. Query your table
  // - replace "messages" with your table name
  // - select("*") = fetch all columns
  // - limit(10) = only fetch up to 10 rows
  // - order("id", { ascending: false }) = optional, ensures consistent ordering
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .limit(10);

  // 3. Render the result
  return (
    <div>
      <h1>Supabase Test</h1>

      {/* Show error if query failed */}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {/* Pretty-print the rows as JSON (for debugging/dev use) */}
      <pre>{JSON.stringify(data, null, 2)}</pre>

      {/* Example: Render results in HTML list */}
      <ul>
        {data?.map((row) => (
          <li key={row.id}>{row.content}</li> // adjust "content" to your column
        ))}
      </ul>
    </div>
  );
}

