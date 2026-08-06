import Skeleton from "@/components/ui/skeleton";

// Skelett des Studienplaners.
//
// Wird an zwei Stellen verwendet:
//   1. app/protected/planner/loading.tsx - beim Navigieren zur Seite
//   2. app/protected/planner/page.tsx    - waehrend getSemestersMitModulen()
//      laeuft. Die Seite ist eine Client-Komponente und laedt ihre Daten erst
//      nach der Hydration im useEffect. loading.tsx greift dort also nicht,
//      deshalb braucht die Seite zusaetzlich einen eigenen Ladezustand.
//
// Die Container-Klassen entsprechen denen in page.tsx und semester-card.tsx,
// damit beim Umschalten auf die echten Daten kein Layout-Sprung entsteht.

// Eingeklappte Modulzeile innerhalb einer Semesterkarte
function ModulZeile() {
    return (
        <div className="px-6 py-4 rounded-2xl border-x-4 border-y-2 border-flag-red/40 flex flex-col gap-2 bg-card">
            <div className="flex w-full items-start gap-3">
                {/* Drag-Handle */}
                <Skeleton className="mt-1 h-5 w-5 shrink-0"/>

                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3 max-w-64"/>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16"/>
                        <Skeleton className="h-4 w-24"/>
                    </div>
                    <Skeleton className="h-4 w-20"/>
                </div>

                <Skeleton className="h-6 w-6 shrink-0"/>
            </div>
        </div>
    );
}

// Eine Semesterkarte mit variabler Anzahl an Modulen
function SemesterKarte({module}: { module: number }) {
    return (
        <div className="border-2 rounded-2xl p-4 gap-4 flex flex-col bg-card">
            <header className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-44"/>
                    <Skeleton className="h-4 w-20"/>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-10"/>
                    <Skeleton className="h-4 w-12"/>
                </div>
            </header>

            <div className="flex flex-col gap-2 min-h-15">
                {Array.from({length: module}).map((_, i) => (
                    <ModulZeile key={i}/>
                ))}
            </div>
        </div>
    );
}

const PlannerSkeleton = () => {
    return (
        <section
            role="status"
            aria-label="Studienplaner wird geladen"
            className="flex flex-col gap-4 p-4 md:p-6 animate-pulse"
        >
            <span className="sr-only">Dein Studienplaner lädt...</span>

            {/* Kopfbereich */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-64"/>
                <Skeleton className="h-5 w-72"/>
            </div>

            {/* Semesterkarten - unterschiedlich viele Module, damit es
                nicht zu gleichfoermig wirkt */}
            <div className="flex flex-col gap-6">
                <SemesterKarte module={2}/>
                <SemesterKarte module={3}/>
            </div>

            {/* Buttons: Semester hinzufuegen / entfernen */}
            <div className="flex flex-col gap-4 md:flex-row">
                <Skeleton className="h-14 w-full rounded-2xl md:w-5/6"/>
                <Skeleton className="h-14 w-full rounded-2xl md:w-1/6"/>
            </div>
        </section>
    );
};

export default PlannerSkeleton;
