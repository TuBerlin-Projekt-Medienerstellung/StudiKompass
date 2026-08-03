// Next.js zeigt diese Datei automatisch an, solange page.tsx serverseitig auf
// seine Daten wartet (Noten, Profil, Planer-Module, MOSES-Basisdaten).
//
// Statt eines Spinners wird die spätere Seitenstruktur als Skelett angedeutet.
// Die Container-Klassen sind bewusst identisch zu denen in page.tsx, damit beim
// Umschalten auf die echten Daten kein Layout-Sprung entsteht.

import Skeleton from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div
            role="status"
            aria-label="Dashboard wird geladen"
            className="space-y-6 px-4 py-4 sm:px-6 lg:px-8 animate-pulse"
        >
            <span className="sr-only">Dein Dashboard lädt...</span>

            {/* Kopfbereich: Überschrift + Untertitel */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-52"/>
                <Skeleton className="h-4 w-64"/>
            </div>

            {/* Vier Kennzahlen-Karten */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Gesamtfortschritt: behaelt die rote Markenfarbe, damit der
                    Uebergang zur fertigen Seite ruhiger wirkt */}
                <div className="rounded-2xl bg-flag-red p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="h-6 w-6 rounded-md bg-white/30"/>
                        <div className="h-8 w-20 rounded-md bg-white/30"/>
                    </div>
                    <div className="mt-2 h-4 w-32 rounded-md bg-white/30"/>
                    <div className="mt-4 h-2 rounded-full bg-red-400">
                        <div className="h-2 w-1/3 rounded-full bg-white/60"/>
                    </div>
                </div>

                {/* ECTS, Semester, Gesamtschnitt - letzte Karte hat eine Zeile mehr */}
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-center"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-6 w-6"/>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-16"/>
                                <Skeleton className="h-4 w-20"/>
                                {i === 2 && <Skeleton className="h-3 w-24"/>}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Aktuelles Semester */}
            <section className="rounded-2xl border border-border p-4 bg-card sm:p-5">
                <div className="mb-5 flex items-center justify-between">
                    <Skeleton className="h-6 w-48"/>
                    <Skeleton className="h-4 w-16"/>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start"
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40"/>
                                <Skeleton className="h-4 w-24"/>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 sm:justify-end lg:justify-start">
                                <Skeleton className="h-4 w-16"/>
                                <Skeleton className="h-7 w-28 rounded-full"/>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Meilensteine */}
            <section className="rounded-2xl border border-border p-4 flex flex-col justify-center bg-card sm:p-5">
                <div className="mb-5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6"/>
                        <Skeleton className="h-6 w-36"/>
                    </div>

                    <div className="mt-4 space-y-3">
                        {[0, 1].map((i) => (
                            <div key={i} className="rounded-2xl border border-border bg-card p-4">
                                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Skeleton className="h-5 w-5 rounded-full"/>
                                        <Skeleton className="h-5 w-44"/>
                                    </div>
                                    <Skeleton className="h-5 w-10"/>
                                </div>

                                <div className="h-2 rounded-full bg-gray-200 dark:bg-muted">
                                    <div
                                        className={`h-2 rounded-full bg-gray-300 dark:bg-muted-foreground/40 ${
                                            i === 0 ? "w-2/5" : "w-3/5"
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
