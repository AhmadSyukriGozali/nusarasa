import { createClient } from "@/lib/supabase/server";

export default async function AuthTestPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">
        NusaRasa Auth Test
      </h1>

      <div className="mt-6 rounded-lg border p-4">
        {error ? (
          <div>
            <p className="font-semibold text-red-600">
              Supabase Auth Error
            </p>

            <pre className="mt-2 whitespace-pre-wrap text-sm">
              {error.message}
            </pre>
          </div>
        ) : data?.claims ? (
          <div>
            <p className="font-semibold text-green-600">
              Authenticated
            </p>

            <pre className="mt-2 overflow-auto text-sm">
              {JSON.stringify(data.claims, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <p className="font-semibold">
              Not authenticated
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Belum ada user yang login.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}