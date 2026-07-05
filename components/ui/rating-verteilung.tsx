import {Star} from "lucide-react";

interface RatingVerteilungProps {
    verteilung: Record<VerteilungsStufe, number>;
    gesamtAnzahl: number;
}

const RatingVerteilung = ({verteilung, gesamtAnzahl}: RatingVerteilungProps) => {
    return (
        <div className="flex flex-col gap-1.5 mt-4">
            {([5, 4, 3, 2, 1] as VerteilungsStufe[]).map((stufe) => {
                const anzahl = verteilung[stufe];
                const breite = gesamtAnzahl > 0 ? (anzahl / gesamtAnzahl) * 100 : 0;
                return (
                    <div key={stufe} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2">{stufe}</span>
                        <Star size={12} className="text-amber-400 shrink-0" fill="currentColor"/>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{width: `${breite}%`}}
                            />
                        </div>
                        <span className="w-3 text-right">{anzahl}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RatingVerteilung;