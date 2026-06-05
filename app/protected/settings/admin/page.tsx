"use client";
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AccessDenied from "@/components/access_denied";



export default function AdminPage(){
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    const checkAdmin= useCallback(async () => {
    const supabase = createClient();
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {router.push('/login'); return;}

    const {data} = await supabase
        .from('profiles')
        .select('username, studiengang, avatar_url, is_admin')
        .eq('id', user.id)
        .single()
    if (!data?.is_admin) {return;}

    setIsAuthorized(true);
    }, [router])

    useEffect(() => {checkAdmin();}, [checkAdmin]);
    if (!isAuthorized) {
        return <AccessDenied />;
    }
    return(
        <div style ={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <div>
                <ul>
                    <li>-The account needs to belong to a supabase mandated Admin</li>
                    <li>-There needs to be redirection if the user is not an Admin</li>
                    <li>-Settingspage must have a button to get to the admin Access</li>
                    <li>-The button on the admin access must call the server action to run the decouppled external python script </li>

                </ul>
            </div>

            <button className='bg-green-500 hover:bg-green-600 transition-colors font-semibold text-black px-4 py-2 rounded-lg w-5/6'>
                Start Database backup
            </button>
        </div>)
}
