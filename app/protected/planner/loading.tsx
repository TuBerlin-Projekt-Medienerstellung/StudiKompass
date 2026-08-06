import PlannerSkeleton from "@/components/planner-skeleton";

// Next.js zeigt diese Datei beim Navigieren zum Planer an.
//
// Achtung: page.tsx ist eine Client-Komponente und laedt die Semester erst
// nach der Hydration (useEffect). Dieser Zustand ist deshalb nur kurz sichtbar;
// den eigentlichen Ladevorgang deckt der Skeleton-Zustand in page.tsx ab.
export default function Loading() {
    return <PlannerSkeleton/>;
}
