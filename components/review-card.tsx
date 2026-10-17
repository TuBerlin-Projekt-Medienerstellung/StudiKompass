"use client";
import {ThumbsUp, MessageCircle, ChevronDown, Trash2, Flag} from "lucide-react";
import StarRatingDisplay from "./ui/starrating-display";
import {useState} from "react";
import {avatarFarbe} from "./ui/feedback-utlis";
import { reportReviewAction } from "@/app/protected/modules/feedback-actions"
interface ReviewCardProps {
    bewertung: Bewertung;
    onLoeschen?: (bewertungId: string) => void;
}

const kategorieLabels: { key: keyof KategorieBewertung; label: string }[] = [
    {key: "dozent", label: "Dozent"},
    {key: "vorlesung", label: "Vorlesung"},
    {key: "tutorium", label: "Tutorium"},
    {key: "aufwand", label: "Aufwand"},
    {key: "organisation", label: "Organisation"},
];

const ReviewCard = ({bewertung, onLoeschen}: ReviewCardProps) => {
    const [gemeldet, setGemeldet] = useState(false);
    const [meldetLaden, setMeldetLaden] = useState(false);

    const handleReport = async () => {
        if (gemeldet || meldetLaden) return;
        if (!confirm("Diesen Kommentar wirklich als unangemessen melden?")) return;

        setMeldetLaden(true);
        try {
            await reportReviewAction(bewertung.id);
            setGemeldet(true);
            alert("Vielen Dank! Der Beitrag wurde an das Admin-Team gemeldet.");
        } catch (error: any) {
            alert(error.message || "Fehler beim Melden.");
        } finally {
            setMeldetLaden(false);
        }
    };
    return (
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 items-center">
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarFarbe(
                            bewertung.name
                        )}`}
                    >
                        {bewertung.initialen}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{bewertung.name}</span>
                        <span className="text-xs text-gray-400">
                            {bewertung.semester} · {bewertung.datum}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold shrink-0">
                    <span>{bewertung.gesamtScore.toFixed(1)}</span>
                    <StarRatingDisplay value={bewertung.gesamtScore} size={14}/>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
                {kategorieLabels.map(({key, label}) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>{label}</span>
                        <StarRatingDisplay value={bewertung.kategorien[key]} size={12}/>
                    </div>
                ))}
            </div>

            <p className="text-sm opacity-80">{bewertung.kommentar}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400">
                <button className="flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                    <ThumbsUp size={14}/>
                    Hilfreich ({bewertung.hilfreich})
                </button>
                {bewertung.antworten > 0 && (
                    <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                        <MessageCircle size={14}/>
                        {bewertung.antworten} Antwort{bewertung.antworten !== 1 ? "en" : ""}
                        <ChevronDown size={14}/>
                    </button>
                )}
                {bewertung.istEigene && onLoeschen && (
                    <button
                        onClick={() => onLoeschen(bewertung.id)}
                        className="flex items-center gap-1.5 ml-auto text-flag-red/70 hover:text-flag-red transition-colors"
                    >
                        <Trash2 size={14}/>
                        Löschen
                    </button>
                )}
                {!bewertung.istEigene && (
                    <button
                        onClick={handleReport}
                        disabled={gemeldet || meldetLaden}
                        className={`flex items-center gap-1.5 transition-colors ${
                            bewertung.istEigene ? "" : "ml-auto"
                        } ${
                            gemeldet 
                                ? "text-green-600 cursor-default" 
                                : "text-gray-400 hover:text-red-500"
                        }`}
                        title="Beitrag melden"
                    >
                        <Flag size={14}/>
                        {gemeldet ? "Gemeldet" : meldetLaden ? "Melde..." : "Melden"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;