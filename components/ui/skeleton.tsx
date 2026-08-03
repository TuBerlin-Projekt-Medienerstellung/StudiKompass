// Neutraler Platzhalter für Ladezustände (Skeleton Screens).
//
// Farbwahl: Im hellen Modus liegt --muted bei 96 % Helligkeit und wäre auf
// weissen Karten praktisch unsichtbar, deshalb gray-200. Im dunklen Modus
// passt --muted dagegen gut zum Karten-Hintergrund.

interface SkeletonProps {
    className?: string;
}

const Skeleton = ({className = ""}: SkeletonProps) => {
    return <div className={`rounded-md bg-gray-200 dark:bg-muted ${className}`}/>;
};

export default Skeleton;
