import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: 'StuPass | TU Berlin',
  description: 'Dein Studium, perfekt organisiert.',
};
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 px-6">
      {/* Background Stuff*/}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 dark:bg-emerald-900/20 blur-[120px] rounded-full" />
        <header className="flex flex-col items-center space-y-4">{/*Uhhh..width and height are random, since we don't have a Logo yet..*/}
            <Image
            src= "/Kompass_bild.png"
            alt = "LOGO"
            width={69} 
            height={69}
            className="hover:animate-spin" 

            />{/*Idk.. I thought it would look cool if it spun on hover*/}
        </header>
      </div>

      <div className="text-center max-w-3xl space-y-8">
        {/*Title*/}
        <header className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
            Stu<span className="text-red-600 dark:text-emerald-500">Pass</span>
          </h1>
          <p className="text-red-600/80 dark:text-emerald-500/80 font-mono text-sm tracking-widest uppercase">
            TU Berlin Studenten-Kompass
          </p>
        </header>

        {/* What do we aim to do */}
        <p className="text-zinc-900 dark:text-zinc-400 text-lg md:text-xl leading-relaxed">
          Dein Studium, perfekt organisiert. Plane Module, tracke ECTS, entdecke Vorlagen aus der Community und hol dir den vollen Durchblick mit unseren Kurz-Tutorials. <br />
          <br /> Filter nach nur für dich relevanten Modulen; egal ob <span className="text-zinc-950 dark:text-zinc-200 italic">Wahlpflicht</span> oder <span className="text-zinc-950 dark:text-zinc-200 italic">Plicht</span>. <br/>
          Einfach mit der Campus-Mail einloggen und loslegen. 
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-500 text-black dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20 dark:shadow-emerald-900/20"
          >
            Login
          </Link> {/*I dunno red is the official theme.. but green just looks so much better. Ig the team can vote: bg-rose-600/ bg-red-500?*/}
          <Link
            href="/auth/sign-up"
            className="w-full sm:w-auto px-10 py-4 bg-zinc-500 hover:bg-zinc-400 text-black dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-white font-bold rounded-xl border border-zinc-800 transition-all hover:scale-105 active:scale-95"
          > Create Account
          </Link>
        </div>
      </div>

      {/* Footer*/}
      <footer className="absolute bottom-10 text-zinc-600 text-xs tracking-widest uppercase">
        &copy; 2026 StuPass &bull; Developed by Fallen-debug {/* js a name_filler.. */}
      </footer> 
    </main>
  );
}