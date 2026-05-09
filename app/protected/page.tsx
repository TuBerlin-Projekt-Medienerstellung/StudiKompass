// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import { createAdminClient } from "@/lib/supabase/admin";
// import { revalidatePath } from "next/cache";

// export default async function ProtectedPage() {
//   const supabase = await createClient();

//   {/*User Login check, ->logout option +security*/}
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return redirect("/auth/login");

//   {/* Hopefully we do get the degree API too.. otherwise dgeree specific modules don't make sense
//   response =req.get()..*/}
//   let officialDegrees = [];
//   try {
//     {/* Only fetch if the URL actually exists in your .env*/}
//     if (process.env.DEGREE_API_URL) {
//       const degreeResponse = await fetch(process.env.DEGREE_API_URL, {
//         headers: { 'Authorization': `Bearer ${process.env.DEGREE_API_KEY}` },
//         next: { revalidate: 86400 } // 24h cache in nearby node (in seconds) ->no refetch
//       });
//       if (degreeResponse.ok) {
//         officialDegrees = await degreeResponse.json(); {/*Server side fetch -> no cors problem? */}
//   {/*Dunno what JSON returns..maybe I should have waited with this: [{ "id": "random_num", "name": "deg_name" }, ...]*/}
//       }
//     }
//   } catch (e) {
//     console.error("API spec failed, using fallbacks:", e);
//   }

//   // Data for testing
//   if (!Array.isArray(officialDegrees) || officialDegrees.length === 0) {
//     officialDegrees = [
//       { id: "1", name: "Medieninformatik"},
//       { id: "2", name: "Informatik" },
//       { id: "3", name: "Wirtschaftsinformatik" }
//     ];
//   }{/* Got this: Cannot read properties of undefined (reading 'toString')
//       that's why I added somethings when the fetch returns nothing, which it will, since I dont have a key*/}

//   {/* Studiengang choice*/}
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("studiengang")
//     .eq("id", user.id)
//     .single();

//   // selecting the degree, however bc this is based on speculation, we will leave it as is for now..
//   const updateProfile = async (formData: FormData) => {
//     "use server";
//     const selection = formData.get("studiengang") as string;
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (user) {
//       await supabase.from("profiles").update({ studiengang: selection }).eq("id", user.id);
//       revalidatePath("/protected");
//     }
//   };
//   const deleteUserAction = async () => {
//     "use server";
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (user) {
//       const admin = createAdminClient();
//       await admin.auth.admin.deleteUser(user.id); // Deletes from auth.users; needs some try, catch-> mention on nxt meet
//       await supabase.auth.signOut();
//       return redirect("/auth/login");
//     }
//   };

//   return (
//     <div className="flex-1 w-full flex flex-col gap-12 items-center p-8 bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen">
//       <section className="w-full max-w-4xl space-y-8">
//         <div className="bg-zinc-200 dark:bg-zinc-900 border border-zinc-600 dark:border-zinc-800 p-6 rounded-xl">
//           <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          
//           <form action={updateProfile} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-black dark:text-zinc-400 mb-2">
//                 Studiengangwahl
//               </label>
//               <select 
//                 name="studiengang"
//                 defaultValue={profile?.studiengang || ""}
//                 className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-700 text-black dark:text-white rounded-lg px-4 py-2 outline-none"
//               >
//                 <option value="">-- Wähle deinen Studiengang aus --</option>
                
//                 {/* Loop through api data..cooked for-loop basically*/}
//                 {officialDegrees.map((deg) => (
//                   <option key={deg?.id?.toString() || Math.random()} value={deg?.name || ""}>
//                     {deg?.name || "Unbekannter Studiengang"}
//                   {/*'id' and 'name' are never undefined -> otherwise might return Null, when string required or unknown property */} 
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <button type="submit" className="bg-zinc-400 hover:bg-zinc-200 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-2 rounded-lg font-bold transition-all">
//               Studiengang speichern
//             </button>
//           </form>
//         </div>
//       <div className="bg-zinc-200 dark:bg-zinc-900 border border-red-900/20 p-6 rounded-xl mt-8">
//           <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Warnung, diese Aktion ist permanent</h2>
//           <p className="text-sm text-zinc-400 mb-6">
//             Deleting your account is permanent. All your data will be removed immediately.
//           </p> {/*No idea how to say that in german tbh..*/}
//           <form action={deleteUserAction}>
//             <button 
//               type="submit" 
//               className="bg-red-700 text-black dark:bg-red-900/20 hover:bg-red-900/40 dark:text-red-500 border border-red-900/50 px-6 py-2 rounded-lg font-bold transition-all"
//             >
//               Konto löschen
//             </button>
//           </form>
//         </div>
//       </section>
//     </div>
//   );
// }