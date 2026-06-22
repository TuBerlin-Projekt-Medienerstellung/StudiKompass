import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default function DeleteAccount() {
  
  const deleteUserAction = async () => {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(user.id); 
      await supabase.auth.signOut();
      return redirect("/auth/login");
    }
  };

  return (
    <div className="bg-white dark:bg-card border border-zinc-600 dark:border-border p-6 rounded-xl">
      <h2 className="text-base font-semibold text-black dark:text-white mb-2">
        Warnung, diese Aktion ist permanent
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        Das Löschen deines Kontos ist endgültig. Alle deine Daten werden sofort und unwiderruflich entfernt.
      </p> 
      <form action={deleteUserAction}>
        <button 
          type="submit" 
          className="bg-flag-red text-white hover:bg-red-900 dark:bg-flag-red/15 dark:hover:bg-flag-red/25 dark:text-red-300 border border-flag-red/50 px-6 py-2 rounded-lg font-bold transition-all"
        >
          Konto löschen
        </button>
      </form>
    </div>
  );
}
