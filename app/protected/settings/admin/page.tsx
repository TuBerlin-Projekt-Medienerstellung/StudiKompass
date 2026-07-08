"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback, useRef} from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "@/components/access_denied";
import { triggerBackupScript } from "./actions";

interface LogEntry {
  id: string;
  created_at: string;
  current_status: string;
  latest_message: string;
  history: any[]; 
}
//I should add the active logging in realtime from supabase instead long polling 
//https://supabase.com/docs/guides/realtime/postgres-changes?hl=en-DE

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  //track log entry 
  const [activeLog, setActiveLog] = useState<LogEntry | null>(null);
  const listener = useRef(false); // this instead of the while Polling so it aint js 10s wait time bc of build-time
  
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
    }
    return () => {
    };
  }, [checkAdmin, isAuthorized, fetchLogs]);

  const handleRunScript = async () => {
    setIsLoading(true);
    setActiveLog(null); // Reset active log
    const start = new Date(Date.now() - 10000).toISOString();
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

        {isLoading && activeLog ? (
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