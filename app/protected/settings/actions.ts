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
//I wanna make it so there is a confirmation message for the user on password update 
//and instead of 404 bc of protected, there will be a local logout
export async function updatePassword(newPassword: string) {
    const supabase = await createClient();
    const { error: updateError } = await supabase.auth.updateUser({password: newPassword});
    if (updateError) {
        return { error: updateError.message };
    }
    await supabase.auth.signOut({ scope: "local" });
    redirect("/auth/login");
};