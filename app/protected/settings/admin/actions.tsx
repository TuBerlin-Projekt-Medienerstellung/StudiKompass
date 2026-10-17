"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

async function verifyAdmin(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Forbidden");
}

export async function triggerBackupScript() {
  await verifyAdmin(); 
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

export async function fetchReportsAction() {
  await verifyAdmin();
  const adminSupabase = createAdminClient();
  const { data:rawReports, error }= await adminSupabase
    .from("review_reports")
    .select(`
      id, 
      created_at, 
      review_id,
      bewertung (
        id, 
        kommentar, 
        user_id,
        profiles (username)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch review reports: ${error.message}`);
  type JoinedReport = {
    id: string;
    created_at: string;
    review_id: string;
    bewertung: {
      id: string;
      kommentar: string;
      user_id: string;
      profiles: { username: string } | null;
    } | null;
  };
//review id-> user id(join on public.review_reports and public.bewertung) ->email (auth) (i joined the tables)
//user_id -> profiles (getUserById)
  const reports = (rawReports as unknown) as JoinedReport[];
  
  const authorIds = [...new Set((reports ?? [])
      .map(r => r.bewertung?.user_id)
      .filter(Boolean) as string[])];

    const emailEntries = await Promise.all(authorIds.map(async (authorId) => {
        const { data, error: emailError } = await adminSupabase.auth.admin.getUserById(authorId);
        return {
          authorId,
          email: data.user?.email ?? null,
          error: emailError?.message ?? null,
        };
      }));
  const emailById = new Map(emailEntries.map(({ authorId, email }) => [authorId, email]));

return {
    reports: (reports ?? []).map((report) => ({
      ...report,
      bewertung: report.bewertung ? {
        ...report.bewertung,
        email: emailById.get(report.bewertung.user_id) ?? null,
      } : null,
    })),
    authorCount: authorIds.length,
    profileCount: authorIds.length, 
    emailCount: emailEntries.filter((entry) => entry.email !== null).length,
    emailErrors: emailEntries.filter((entry) => entry.error !== null).map(({ authorId, error }) => ({ authorId, error })),
  };
}
//nodemailer bc no third party service, and native smtp was hell
//update env on github too..
async function sendSmtpEmail({to, subject, html}: {to: string; subject: string; html: string}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER oder SMTP_PASS in .env.local fehlt!");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587 ->Starttls
    auth: {
      user,
      pass,
    },
  });

  const sender = user.includes("@") ? user : `${user}@tu-berlin.de`;

  await transporter.sendMail({
    from: `"NAVIS Team" <${sender}>`,
    to,
    subject,
    html,
  });
}
// confirm
export async function confirmReportAction({reportId, reviewId, authorId, commentText,}: {
  reportId: string; //reporter
  reviewId: string;//bad guy
  authorId: string;
  commentText: string;
}) {
  await verifyAdmin();
  const adminSupabase = createAdminClient();
  // supabase should have a report count, bc at report 3 account gets deleted
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("reports")
    .eq("id", authorId)
    .single();
  if (profileError) throw new Error(`Failed to load report count: ${profileError.message}`);

  const newReportCount = (profile?.reports || 0) + 1;

  //auto email
  if (authorId){
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(authorId);
    const authorEmail = userData?.user?.email;

    if (userError) {
      return { success: false, emailSent: false, emailError: userError.message };
    } else if (authorEmail) {
      try {
        await sendSmtpEmail({
          to: authorEmail,
          subject: "Dein Beitrag verstößt gegen die Nutzungsbedingungen",
          html: `
            <div style="font-family: sans-serif; line-height: 1.5; color: #131212;">
              <h2>Hinweis zu deinem Beitrag</h2>
              <p>Guten Tag,</p>
              <p>dein folgender Kommentar wurde von einem NAVIS Administrator geprüft und aufgrund eines Verstoßes gegen unsere Richtlinien entfernt:</p>
              
              <blockquote style="background: #b6a0a0; border-left: 4px solid #c5101c; margin: 15px 0; padding: 12px 16px; font-style: italic;">
                "${commentText}"
              </blockquote>

              <p>Du hast aktuell <strong>${newReportCount} Verwarnung(en)</strong>.</p>
              <p>Falls du dies für einen Fehler hältst, benachrichtige bitte den Administrator unter: <a href="mailto:admin@tu-berlin.de">admin@tu-berlin.de</a>.</p>
            </div>
          `,
        });
      } catch (err) {
        const emailError = err instanceof Error ? err.message : String(err);
        return { success: false, emailSent: false, emailError };
      }
    } else {
      return { success: false, emailSent: false, emailError: "No email address found for this author ID." };
    }
  } else {
    return { success: false, emailSent: false, emailError: "No author ID found for this review." };
  }

  //del comments
  const { error: deleteReviewError } = await adminSupabase.from("bewertung").delete().eq("id", reviewId);
  if (deleteReviewError) throw new Error(`Failed to remove reported review: ${deleteReviewError.message}`);

  const { error: updateProfileError } = await adminSupabase
    .from("profiles")
    .update({ reports: newReportCount })
    .eq("id", authorId);
  if (updateProfileError) throw new Error(`Failed to update report count: ${updateProfileError.message}`);

  //del from admin list
  const { error: deleteReportError } = await adminSupabase.from("review_reports").delete().eq("id", reportId);
  if (deleteReportError) throw new Error(`Failed to remove report: ${deleteReportError.message}`);

  return { success: true, emailSent: true, emailError: null };
}

//decline
export async function declineReportAction(reportId: string) {
  await verifyAdmin();
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("review_reports").delete().eq("id", reportId);
  if (error) throw new Error(`Failed to dismiss report: ${error.message}`);
  return { success: true };
}
