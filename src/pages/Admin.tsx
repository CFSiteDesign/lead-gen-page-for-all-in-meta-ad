import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  referrer: string | null;
};

function LoginForm({ onError }: { onError: (m: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) onError(error.message);
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm border-[3px] border-mm-bone bg-mm-black p-6">
      <h1 className="font-display text-3xl leading-none text-mm-bone">ALL IN — LEADS</h1>
      <p className="mt-2 text-sm font-semibold text-mm-bone/60">Sign in to view submissions.</p>

      <label className="mt-6 block font-sticker text-[10px] tracking-[0.18em] text-mm-bone/70">
        EMAIL
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-[3px] border-mm-bone bg-mm-paper px-3 py-2 font-sans text-sm font-semibold tracking-normal text-mm-black"
        />
      </label>

      <label className="mt-4 block font-sticker text-[10px] tracking-[0.18em] text-mm-bone/70">
        PASSWORD
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border-[3px] border-mm-bone bg-mm-paper px-3 py-2 font-sans text-sm font-semibold tracking-normal text-mm-black"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full border-[3px] border-mm-bone bg-mm-lime px-5 py-3 font-display text-lg text-mm-black disabled:opacity-60"
      >
        {busy ? "SIGNING IN…" : "SIGN IN"}
      </button>
    </form>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setLeads([]);
      return;
    }
    setLoading(true);
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setLeads((data ?? []) as Lead[]);
        setLoading(false);
      });
  }, [session]);

  const exportCsv = () => {
    const cols: (keyof Lead)[] = [
      "created_at", "name", "email", "phone", "nationality",
      "source", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "referrer",
    ];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-in-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) {
    return <main className="min-h-screen bg-mm-black" />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mm-black px-5">
        <div className="w-full max-w-sm">
          <LoginForm onError={setError} />
          {error && <p className="mt-3 text-sm font-semibold text-mm-orange">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mm-black px-5 py-10 text-mm-bone md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-[4px] border-mm-bone pb-5">
          <h1 className="font-display text-[2rem] leading-none md:text-[2.75rem]">
            LEADS <span className="text-mm-lime">({leads.length})</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="border-[3px] border-mm-bone bg-mm-lime px-4 py-2 font-sticker text-[11px] tracking-[0.14em] text-mm-black"
            >
              EXPORT CSV
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="border-[3px] border-mm-bone px-4 py-2 font-sticker text-[11px] tracking-[0.14em]"
            >
              SIGN OUT
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-mm-orange">{error}</p>}

        {loading ? (
          <p className="mt-8 font-semibold text-mm-bone/60">Loading…</p>
        ) : leads.length === 0 ? (
          <p className="mt-8 font-semibold text-mm-bone/60">No leads yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto border-[3px] border-mm-bone">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-mm-bone text-mm-black">
                <tr className="font-sticker text-[10px] tracking-[0.14em]">
                  <th className="px-3 py-2">DATE</th>
                  <th className="px-3 py-2">NAME</th>
                  <th className="px-3 py-2">EMAIL</th>
                  <th className="px-3 py-2">PHONE</th>
                  <th className="px-3 py-2">NATIONALITY</th>
                  <th className="px-3 py-2">CAMPAIGN</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-mm-bone/25 font-semibold">
                    <td className="whitespace-nowrap px-3 py-2 text-mm-bone/70">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{l.name}</td>
                    <td className="px-3 py-2">{l.email}</td>
                    <td className="whitespace-nowrap px-3 py-2">{l.phone}</td>
                    <td className="px-3 py-2">{l.nationality}</td>
                    <td className="px-3 py-2 text-mm-bone/70">{l.utm_campaign ?? l.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
