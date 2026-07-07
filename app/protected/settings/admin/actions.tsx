"use server";

import { createClient } from "@/lib/supabase/server";

export async function triggerBackupScript() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Forbidden");

  //Trigger github actions workflow via Repository Dispatch
  const GITHUB_REPO = "TuBerlin-Projekt-Medienerstellung/StudiKompass"; 
  const GITHUB_PAT = process.env.GITHUB_PAT;

  if (!GITHUB_PAT) {
    throw new Error("Server configuration error: Missing GITHUB_PAT");
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "trigger-update-extended-search", // repository_dispatch -> types
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to trigger workflow: ${err}`);
  }

  return { success: true };
}