"use client";

import {useMemo, useState} from "react";
import {ChevronUp, ChevronDown, MessageSquare, Star, X} from "lucide-react";
import FeedbackSummary from "./feedback-summary";
import ReviewCard from "./review-card";
import ReviewForm from "./review-form";
import {initialeBewertungen} from "@/constants";
import {
    berechneGesamtScore,
    berechneKategorieDurchschnitt,
    berechneVerteilung,
    initialenAusName,
} from "./ui/feedback-utlis";

interface ModulFeedbackProps {
    modulId: number;
    modulName: string;
}

const sortierOptionen: { key: SortOption; label: string }[] = [
    {key: "hilfreichste", label: "Hilfreichste"},
    {key: "neueste", label: "Neueste"},
    {key: "beste", label: "Beste"},
];

const ModulFeedback = ({modulId, modulName}: ModulFeedbackProps) => {
    // TODO: initialeBewertungen ersetzen durch echten API-Call (z.B. ladeBewertungenAction(modulId)),
    // sobald der Backend-Endpoint für Bewertungen steht.
    void modulId;

    const [open, setOpen] = useState(false);
    const [schreibtBewertung, setSchreibtBewertung] = useState(false);
    const [sortierung, setSortierung] = useState<SortOption>("hilfreichste");
    const [bewertungen, setBewertungen] = useState<Bewertung[]>(initialeBewertungen);

    const gesamtScore = useMemo(() => berechneGesamtScore(bewertungen), [bewertungen]);
    const kategorieDurchschnitt = useMemo(() => berechneKategorieDurchschnitt(bewertungen), [bewertungen]);
    const verteilung = useMemo(() => berechneVerteilung(bewertungen), [bewertungen]);

    const sortierteBewertungen = useMemo(() => {
        const kopie = [...bewertungen];
        switch (sortierung) {
            case "neueste":
                return kopie.sort((a, b) => b.datumSort - a.datumSort);
            case "beste":
                return kopie.sort((a, b) => b.gesamtScore - a.gesamtScore);
            default:
                return kopie.sort((a, b) => b.hilfreich - a.hilfreich);
        }
    }, [bewertungen, sortierung]);

    const handleAbschicken = (kategorien: KategorieBewertung, semester: string, kommentar: string) => {
        // TODO: hier später POST an Backend statt nur lokalem State
        const werte = Object.values(kategorien);
        const score = werte.reduce((summe, w) => summe + w, 0) / werte.length;
        const name = "Du";

        const neueBewertung: Bewertung = {
            id: crypto.randomUUID(),
            name,
            initialen: initialenAusName(name),
            semester,
            datum: new Date().toLocaleDateString("de-DE", {day: "2-digit", month: "short", year: "numeric"}),
            datumSort: Date.now(),
            kategorien,
            gesamtScore: score,
            kommentar,
            hilfreich: 0,
            antworten: 0,
        };

        setBewertungen((prev) => [neueBewertung, ...prev]);
        setSchreibtBewertung(false);
    };

    return (
        <div className="flex flex-col">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between bg-[#E3E6EA] rounded-xl px-4 py-3 hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-black text-white rounded-full p-1.5">
                        <MessageSquare size={14}/>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">Studierenden-Feedback</span>
                        <span className="text-xs text-gray-500">
                            {bewertungen.length} Bewertung{bewertungen.length !== 1 ? "en" : ""} ansehen
                        </span>
                    </div>
                </div>
                {open ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>

            <div
                className={`grid transition-all duration-700 ease-in-expo ${open ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center md:flex-row flex-col gap-3">
                            <h2 className="font-bold text-lg">Studierenden-Forum</h2>
                            <button
                                onClick={() => setSchreibtBewertung(!schreibtBewertung)}
                                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                                    schreibtBewertung ? "bg-white border border-gray-300" : "bg-flag-red text-white"
                                }`}
                            >
                                {schreibtBewertung ? (
                                    <>
                                        <X size={14}/>
                                        Abbrechen
                                    </>
                                ) : (
                                    <>
                                        <Star size={14} fill="currentColor"/>
                                        Bewertung schreiben
                                    </>
                                )}
                            </button>
                        </div>

                        <FeedbackSummary
                            gesamtScore={gesamtScore}
                            anzahlBewertungen={bewertungen.length}
                            verteilung={verteilung}
                            kategorieDurchschnitt={kategorieDurchschnitt}
                        />

                        {schreibtBewertung && (
                            <ReviewForm
                                modulName={modulName}
                                onAbbrechen={() => setSchreibtBewertung(false)}
                                onAbschicken={handleAbschicken}
                            />
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500 mr-1">Sortieren:</span>
                            {sortierOptionen.map(({key, label}) => (
                                <button
                                    key={key}
                                    onClick={() => setSortierung(key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        sortierung === key
                                            ? "bg-black text-white"
                                            : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            {sortierteBewertungen.map((bewertung) => (
                                <ReviewCard key={bewertung.id} bewertung={bewertung}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulFeedback;