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
    <div className="bg-zinc-200 dark:bg-zinc-900 border border-red-900/20 p-6 rounded-xl mt-8">
      <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
        Warnung, diese Aktion ist permanent
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        Das Löschen deines Kontos ist endgültig. Alle deine Daten werden sofort und unwiderruflich entfernt.
      </p> 
      <form action={deleteUserAction}>
        <button 
          type="submit" 
          className="bg-red-700 text-black dark:bg-red-900/20 hover:bg-red-900/40 dark:text-red-500 border border-red-900/50 px-6 py-2 rounded-lg font-bold transition-all"
        >
          Konto löschen
        </button>
      </form>
    </div>
  );
}