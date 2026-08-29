import { supabase } from "@/integrations/supabase/client";

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  nationality: string;
}

/**
 * Meta sends click attribution in the query string. Grabbing it at submit time
 * keeps the lead row joinable back to the ad set that paid for it.
 */
function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => params.get(k) || null;

  return {
    source: "all-in-meta-ad",
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
    fbclid: get("fbclid"),
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
  };
}

export async function submitLead(input: LeadInput): Promise<void> {
  const row = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    nationality: input.nationality,
    ...captureAttribution(),
  };

  if (!supabase) {
    // No credentials in this environment. Fail loudly in prod; in local dev,
    // log the row so the form can still be exercised end to end.
    if (import.meta.env.DEV) {
      console.warn("[leads] Supabase not configured — lead NOT saved:", row);
      return;
    }
    throw new Error("Lead capture is not configured.");
  }

  const { error } = await supabase.from("leads").insert(row);
  if (error) throw new Error(error.message);
}
