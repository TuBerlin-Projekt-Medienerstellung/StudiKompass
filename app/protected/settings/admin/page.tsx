"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "@/components/access_denied";
import { triggerBackupScript } from "app/protected/settings/admin/actions.tsx";

interface LogEntry {
  id: string;
  created_at: string;
  current_status: string;
  latest_message: string;
  history: any[];
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const checkAdmin = useCallback(async () => {
    const supabase = createClient();
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

  useEffect(() => {
    checkAdmin();
    if (isAuthorized) {
      fetchLogs();
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [checkAdmin, isAuthorized, fetchLogs]);

  // Long-poll the active script execution until terminal status achieved
  const startLogPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    const startTime = new Date().toISOString();

    pollingIntervalRef.current = setInterval(async () => {
      const supabase = createClient();
      
      // Look for the newest log entry spawned after button press
      const { data } = await supabase
        .from("logs")
        .select("*")
        .gt("created_at", startTime)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        fetchLogs(); // Sync entire history list view

        if (data.current_status === "SUCCESS" || data.current_status === "ERROR" || data.current_status === "CRITICAL") {
          setIsLoading(false);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
      }
    }, 4000); 
  };

  const handleRunScript = async () => {
    setIsLoading(true);
    try {
      await triggerBackupScript();
      startLogPolling();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (!isAuthorized) return <AccessDenied />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 className="text-2xl font-bold">Admin Access</h1>
      
      <button
        onClick={handleRunScript}
        disabled={isLoading}
        className={`transition-colors font-semibold text-black px-4 py-2 rounded-lg w-5/6 ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isLoading ? "Workflow Triggered & Fetching Docker Logs..." : "Start Database backup"}
      </button>

      <div className="bg-neutral-900 text-white p-4 rounded-lg w-5/6 font-mono text-sm max-h-60 overflow-y-auto">
        <h3 className="font-bold mb-2 border-b border-gray-700 pb-1 text-gray-400">Execution Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs found.</p>
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