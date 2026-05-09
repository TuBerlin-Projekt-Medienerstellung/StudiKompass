import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100">
      
      {/* Navbar for testing the new routing */}
      <nav className="w-full border-b border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-900 h-16 flex items-center px-6">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
          
          {/* Logo..and old design, bc the new fonts and stuff aren't ready */}
          <div className="font-black text-xl tracking-tighter">
            Stu<span className="text-red-600 dark:text-emerald-500">Pass</span>
          </div>

          {/* Routing Tabs for the new pages (forum, settings and modules..)*/}
          <div className="flex gap-6 font-semibold text-sm">
            <Link href="/protected/dashboard" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/protected/forum" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
              Forum
            </Link>
            <Link href="/protected/modules" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
              Module
            </Link>
            <Link href="/protected/settings" className="hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
              Einstellungen
            </Link>
          </div>

          <ThemeSwitcher />
          <LogoutButton/>

        </div>
      </nav>


      <main className="flex-1 w-full max-w-5xl mx-auto p-6">
        {children}
      </main>
      
    </div>
  );
}