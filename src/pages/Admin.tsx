import { useCallback, useEffect, useState } from "react";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

const SESSION_KEY = "all-in-admin-session";

async function adminRequest(body: Record<string, string>) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => null)) as
    | { error?: string; token?: string; leads?: Lead[]; changed?: boolean }
    | null;
  if (!res.ok || !payload) {
    throw new Error(payload?.error ?? "Something went wrong. Please try again.");
  }
  return payload;
}

function LoginForm({ onSignedIn, onError }: { onSignedIn: (token: string) => void; onError: (m: string) => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    onError("");
    try {
      const data = await adminRequest({ action: "login", password });
      if (!data.token) throw new Error("Could not start an admin session.");
      onSignedIn(data.token);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Incorrect password.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm border-[3px] border-mm-bone bg-mm-black p-6">
      <h1 className="font-display text-3xl leading-none text-mm-bone">ALL IN — LEADS</h1>
      <p className="mt-2 text-sm font-semibold text-mm-bone/60">Enter the admin password to view submissions.</p>

      <label className="mt-6 block font-sticker text-[10px] tracking-[0.18em] text-mm-bone/70">
        PASSWORD
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border-[3px] border-mm-bone bg-mm-paper px-3 py-2 font-sans text-sm font-semibold tracking-normal text-mm-black"
        />
      </label>

      <Button
        type="submit"
        disabled={busy}
        className="mt-6 h-auto w-full rounded-none border-[3px] border-mm-bone bg-mm-lime px-5 py-3 font-display text-lg text-mm-black hover:bg-mm-lime/90"
      >
        {busy ? "SIGNING IN…" : "SIGN IN"}
      </Button>
    </form>
  );
}

function ChangePassword({ token, onChanged, onCancel }: { token: string; onChanged: () => void; onCancel: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      await adminRequest({ action: "change-password", token, currentPassword, newPassword });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mm-black/85 px-5" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <form onSubmit={submit} className="w-full max-w-md border-[3px] border-mm-bone bg-mm-black p-6 shadow-mm-bone-sm">
        <h2 id="change-password-title" className="font-display text-2xl">CHANGE PASSWORD</h2>
        <div className="mt-6 space-y-4">
          {[
            ["CURRENT PASSWORD", currentPassword, setCurrentPassword],
            ["NEW PASSWORD", newPassword, setNewPassword],
            ["CONFIRM NEW PASSWORD", confirmPassword, setConfirmPassword],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="block font-sticker text-[10px] text-mm-bone/70">
              {label as string}
              <input type="password" required value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="mt-1 w-full border-[3px] border-mm-bone bg-mm-paper px-3 py-2 font-sans text-mm-black" />
            </label>
          ))}
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-mm-orange">{error}</p>}
        <div className="mt-6 flex gap-3">
          <Button type="button" onClick={onCancel} variant="outline" className="h-auto flex-1 rounded-none border-[3px] border-mm-bone bg-transparent py-3 font-sticker text-[11px] text-mm-bone hover:bg-mm-bone hover:text-mm-black">CANCEL</Button>
          <Button type="submit" disabled={busy} className="h-auto flex-1 rounded-none border-[3px] border-mm-bone bg-mm-lime py-3 font-sticker text-[11px] text-mm-black hover:bg-mm-lime/90">{busy ? "SAVING…" : "SAVE"}</Button>
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? "");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken("");
    setLeads([]);
    setChangingPassword(false);
  }, []);

  const signedIn = (nextToken: string) => {
    sessionStorage.setItem(SESSION_KEY, nextToken);
    setToken(nextToken);
    setError("");
  };

  useEffect(() => {
    if (!token) {
      setLeads([]);
      return;
    }
    setLoading(true);
    adminRequest({ action: "list", token })
      .then((data) => setLeads(data.leads ?? []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load leads.");
        signOut();
      })
      .finally(() => setLoading(false));
  }, [token, signOut]);

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

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mm-black px-5">
        <div className="w-full max-w-sm">
          <LoginForm onSignedIn={signedIn} onError={setError} />
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
            <Button
              onClick={exportCsv}
              className="h-auto rounded-none border-[3px] border-mm-bone bg-mm-lime px-4 py-2 font-sticker text-[11px] text-mm-black hover:bg-mm-lime/90"
            >
              EXPORT CSV
            </Button>
            <Button
              onClick={() => setChangingPassword(true)}
              variant="outline"
              className="h-auto rounded-none border-[3px] border-mm-bone bg-transparent px-4 py-2 font-sticker text-[11px] text-mm-bone hover:bg-mm-bone hover:text-mm-black"
            >
              CHANGE PASSWORD
            </Button>
            <Button onClick={signOut} variant="outline" className="h-auto rounded-none border-[3px] border-mm-bone bg-transparent px-4 py-2 font-sticker text-[11px] text-mm-bone hover:bg-mm-bone hover:text-mm-black">SIGN OUT</Button>
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
      {changingPassword && <ChangePassword token={token} onCancel={() => setChangingPassword(false)} onChanged={() => {
        signOut();
        setError("Password changed. Sign in with your new password.");
      }} />}
    </main>
  );
}
