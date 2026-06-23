import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {redirect} from "next/navigation";
import {Button} from "@/components/ui/button";
import {CardHeader, CardTitle} from "@/components/ui/card";
import {Trash2} from "lucide-react";
import React from "react";

export default function DeleteAccount() {

    const deleteUserAction = async () => {
        "use server";
        const supabase = await createClient();
        const {data: {user}} = await supabase.auth.getUser();

        if (user) {
            const admin = createAdminClient();
            await admin.auth.admin.deleteUser(user.id);
            await supabase.auth.signOut();
            return redirect("/auth/login");
        }
    };

    return (
        <div className=" p-6 rounded-xl border-2 bg-card text-card-foreground shadow-sm">
            <CardHeader className="flex flex-row gap-4 p-0.5 md:justify-start ">
                <Trash2 className="text-flag-red w-7 h-7 stroke-2"></Trash2>
                <CardTitle className="text-xl font-bold">Konto löschen</CardTitle>
            </CardHeader>
            <h2 className="text-base font-semibold text-black dark:text-zinc-500 mb-2 pt-3">
                Warnung! diese Aktion ist permanent.
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
                Das Löschen deines Kontos ist endgültig. Alle deine Daten werden sofort und unwiderruflich entfernt.
            </p>
            <form action={deleteUserAction}>
                <Button
                    type="submit"
                    className="w-full bg-flag-red"
                >
                    Konto löschen
                </Button>
            </form>
        </div>
    );
}
