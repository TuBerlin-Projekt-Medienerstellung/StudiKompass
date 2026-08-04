"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const deleteUserAction = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(user.id);
        await supabase.auth.signOut();
        return redirect("/auth/login");
    }
};