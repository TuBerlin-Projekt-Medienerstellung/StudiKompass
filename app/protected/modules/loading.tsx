import Skeleton from "@/components/ui/skeleton";

// Next.js zeigt diese Datei an, solange page.tsx serverseitig den Studiengang
// des Nutzers ermittelt (getUserStudiengangId).
//
// Der eigentliche MOSES-Katalog wird erst nach einem Klick auf einen
// Filter-Button geladen; diesen Zustand deckt moses-module.tsx selbst ab.
//
// Die Container-Klassen entsprechen denen in page.tsx, damit beim Umschalten
// auf die echten Daten kein Layout-Sprung entsteht.
export default function Loading() {
    return (
        <section
            role="status"
            aria-label="Modulkatalog wird geladen"
            className="flex flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 animate-pulse"
        >
            <span className="sr-only">Der Modulkatalog lädt...</span>

            {/* Kopfbereich: Titel/Untertitel links, Button rechts */}
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="w-full space-y-2">
                    <Skeleton className="h-8 w-56"/>
                    <Skeleton className="h-5 w-72"/>
                </div>

                <Skeleton className="h-11 w-full shrink-0 rounded-2xl md:w-52"/>
            </header>

            <div className="rounded-2xl border border-border bg-white p-4 dark:bg-card sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4">
                    {/* Umschalter "Erweiterte Suche" */}
                    <div className="flex w-full md:justify-end">
                        <Skeleton className="h-11 w-full rounded-2xl md:w-72"/>
                    </div>

                    {/* Die drei Filter-Buttons */}
                    <div className="grid w-full grid-cols-3 gap-2">
                        <Skeleton className="h-10 rounded-2xl"/>
                        <Skeleton className="h-10 rounded-2xl"/>
                        <Skeleton className="h-10 rounded-2xl"/>
                    </div>

                    {/* Andeutung der Modulliste */}
                    <div className="flex flex-col gap-4 pt-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-full rounded-xl border-y-2 border-x-4 border-border px-4 py-4 sm:px-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 gap-3">
                                        <Skeleton className="mt-1 h-6 w-6 shrink-0 rounded-full"/>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <Skeleton className="h-6 w-3/4 max-w-80"/>
                                            <Skeleton className="h-4 w-48"/>
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-6 shrink-0"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
