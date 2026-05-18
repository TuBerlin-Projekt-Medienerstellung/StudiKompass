import Studiengangwahl from "@/components/studiengangwahl";
import { createClient } from "@/lib/supabase/server";
export default async function DashboardPage() {
  const supabase = await createClient();
  

  // layout handles redirection
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>This is the dashboard tab</p>
    </div>
  );
}