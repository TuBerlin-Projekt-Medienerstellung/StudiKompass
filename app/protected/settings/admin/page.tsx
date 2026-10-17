"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useRef} from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "@/components/access_denied";
import { triggerBackupScript, fetchReportsAction, confirmReportAction, declineReportAction } from "./actions";


interface LogEntry {
  id: string;
  created_at: string;
  current_status: string;
  latest_message: string;
  history: any[]; 
}
//I should add the active logging in realtime from supabase instead long polling 
//https://supabase.com/docs/guides/realtime/postgres-changes?hl=en-DE

interface ReportEntry {
  id: string;
  created_at: string;
  review_id: string;
  bewertung: {
  id: string;
      kommentar: string;
      user_id: string;
      email: string | null;
      profiles?: {
        username: string;
      }| null;
  } | null;
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  //track log entry 
  const [activeLog, setActiveLog] = useState<LogEntry | null>(null);
  const listener = useRef(false); // this instead of the while Polling so it aint js 10s wait time bc of build-time
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const checkAdmin = useCallback(async () => {
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data } = await supabase
      .from('profiles')
      .select('username, studiengang, avatar_url, is_admin')
      .eq('id', user.id)
      .single();
    if (!data?.is_admin) { return; }

    setIsAuthorized(true);
  }, [router]);

    const fetchLogs = useCallback(async () => {
    const supabase = createClient(); 
    const { data } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setLogs(data);
  }, []);

  const fetchReports = useCallback(async () => {
      console.log("[admin reports] fetchReports called");
      try {
        const result = await fetchReportsAction();
        setReports(result.reports as unknown as ReportEntry[]);
      } catch (error) {
        console.log("[admin reports] query result", { count: null, error });
      }
    }, []);

  const handleConfirm = async (report: ReportEntry) => {
    if (!report.bewertung) return;
    if (!confirm("Bewertung unwiderruflich löschen, Autor verwarnen (+1) und E-Mail senden?")) return;

    const result = await confirmReportAction({
      reportId: report.id,
      reviewId: report.review_id,
      authorId: report.bewertung?.user_id,
      commentText: report.bewertung?.kommentar,
    });

    if (!result.emailSent) {
      alert(`E-Mail konnte nicht gesendet werden. Bewertung und Verwarnung wurden nicht geändert; die Meldung bleibt offen. Fehler: ${result.emailError ?? "Unbekannter Fehler"}`);
    }

    fetchReports();
  };

  const handleDecline = async (reportId: string) => {
    await declineReportAction(reportId);
    fetchReports();
  };
    // Only subscribe once a process was started
    //I found that the docker image build takes a long time and that's why my current logs listening is failing
    //what if I engage an event listener in a loop like in tkinter?
  useEffect(() => {
    if (!isAuthorized) return;
    const supabase = createClient();
    
    const channel = supabase
      .channel('logs-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'logs' },
        (payload) => {
          // If triggered new workflow
          if (listener.current) {
            setActiveLog(payload.new as LogEntry);
            listener.current = false; 
          }
          fetchLogs(); // Refresh the list in the background
          fetchReports();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'logs' },
        (payload) => {
          const updatedLog = payload.new as LogEntry;
          
          setActiveLog((prevLog) => {
            // Only update the state if it belongs to the active log
            if (prevLog && prevLog.id === updatedLog.id) {
              return updatedLog;
            }
            return prevLog;
          });

          // Check for terminal states to re-enable the UI
          const status = updatedLog.current_status;
          if (["SUCCESS", "ERROR", "CRITICAL"].includes(status)) {
            setIsLoading(false);
            listener.current = false; 
            fetchLogs(); 
          }
        }
      )
      .subscribe(); //supabase realtime

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthorized, fetchLogs]);

  useEffect(() => {
    checkAdmin();
    if (isAuthorized) {
      fetchLogs();
      fetchReports();
    }
    return () => {
    };
  }, [checkAdmin, isAuthorized, fetchLogs]);

  const handleRunScript = async () => {
    setIsLoading(true);
    setActiveLog(null); // Reset active log
    //const start = new Date(Date.now() - 10000).toISOString();
    listener.current = true;
    try {
      await triggerBackupScript();
    }
    catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
//same logic as before
  if (!isAuthorized) return <AccessDenied />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="text-2xl font-bold">Admin Access</h1>
      <div className="w-5/6 flex flex-col gap-3">
        <h2 className="text-lg font-bold">Gemeldete Bewertungen ({reports.length})</h2>

        {reports.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Keine offenen Meldungen</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <div key={report.id} className="border border-neutral-800 bg-neutral-900 text-white p-4 rounded-lg flex flex-col gap-2">
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Autor: <strong className="text-gray-200">{report.bewertung?.profiles?.username ?? "Unbekannt"}</strong>{report.bewertung?.email ? ` · ${report.bewertung.email}` : ""}</span>
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                
                <p className="text-sm italic bg-neutral-800 p-2.5 rounded text-gray-300 border-l-2 border-red-500">
                  "{report.bewertung?.kommentar}"
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  {/* decline -> no actions */}
                  <button
                    onClick={() => handleDecline(report.id)}
                    className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded"
                  >
                    Decline (Ignorieren)
                  </button>

                  {/* confirm ->del + email + supabase count+1 */}
                  <button
                    onClick={() => handleConfirm(report)}
                    className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                  >
                    Confirm (Löschen & Verwarnen)
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleRunScript}
        disabled={isLoading}
        className={`transition-colors font-semibold text-black px-4 py-2 rounded-lg w-5/6 ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isLoading ? "Workflow Triggered..." : "Start Database backup"}
      </button>

      <div className="bg-neutral-900 text-white p-4 rounded-lg w-5/6 font-mono text-sm max-h-96 overflow-y-auto">
        <h3 className="font-bold mb-2 border-b border-gray-700 pb-1 text-gray-400">
          {isLoading ? "Live Execution History" : "Recent Execution Logs"}
        </h3>

        {isLoading ? ( activeLog ? (
          <div>
            <div className="mb-4 p-2 bg-neutral-800 rounded">
              <span className="text-yellow-400 font-bold">Status: {activeLog.current_status}</span>
            </div>
            {activeLog.history && activeLog.history.length > 0 ? (activeLog.history.map((msg, index) => (
              <div key={index} className="text-gray-300 mb-1">
                <span className="text-gray-500 text-xs">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </span>
                <span className="ml-2 font-bold text-blue-400">[{msg.level}]</span>
                <span className="ml-2">{msg.message}</span>
              </div>
          ))
          ) : (
              <div className="text-gray-500 italic">Waiting for history...</div>)}
          </div>
          ) : (
             <div className="text-yellow-500 italic animate-pulse py-2">
              Waiting for Docker container to build and initialize...
            </div>
          )
          ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-2 border-b border-neutral-800 pb-1">
              <span className="text-gray-500">[{new Date(log.created_at).toLocaleTimeString()}]</span>{" "}
              <span className={`font-bold ${log.current_status === 'SUCCESS' ? 'text-green-400' : 'text-yellow-400'}`}>
                {log.current_status}
              </span>{" "}
              — {log.latest_message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
