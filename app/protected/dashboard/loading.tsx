export default function Loading() {
  return (
    // Next.js zeigt diesen Zustand automatisch, waehrend das Dashboard serverseitig geladen wird.
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      <p className="ml-4 text-zinc-500">Dein Dashboard lädt...</p>
    </div>
  );
}
// Und auch hier verhindern wir einen leeren Bildschirm, wenn die geschuetzte Route auf Daten wartet.
