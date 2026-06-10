import Studiengangwahl from "@/components/studiengangwahl";
import {createClient} from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    // layout handles redirection
    const {data: {user}} = await supabase.auth.getUser();
    return (
        <div>
            <h1 className="text-2xl font-bold border-2 md:border-black border-red-800">Dashboard</h1>
            <p>Hello</p>
        </div>
    );
}

