"use client";

import {useMemo, useState} from "react";
import {ChevronUp, ChevronDown, MessageSquare, Star, X} from "lucide-react";
import FeedbackSummary from "./feedback-summary";
import ReviewCard from "./review-card";
import ReviewForm from "./review-form";
import {
    erstelleBewertungAction,
    ladeBewertungenAction,
    loescheBewertungAction,
} from "@/app/protected/modules/feedback-actions";
import {handleModule} from "@/lib/utils";
import {
    berechneGesamtScore,
    berechneKategorieDurchschnitt,
    berechneVerteilung,
} from "./ui/feedback-utlis";

interface ModulFeedbackProps {
    modulId: ModuleId;
    modulName: string;
}

const sortierOptionen: { key: SortOption; label: string }[] = [
    {key: "hilfreichste", label: "Hilfreichste"},
    {key: "neueste", label: "Neueste"},
    {key: "beste", label: "Beste"},
];

const ModulFeedback = ({modulId, modulName}: ModulFeedbackProps) => {
    // bewertung.modul_id ist Text: speichert MOSES-Nummern und UUIDs gleichermaßen
    const modulKey = handleModule(modulId);

    const [open, setOpen] = useState(false);
    const [schreibtBewertung, setSchreibtBewertung] = useState(false);
    const [sortierung, setSortierung] = useState<SortOption>("hilfreichste");
    const [bewertungen, setBewertungen] = useState<Bewertung[]>([]);
    const [geladen, setGeladen] = useState(false);
    const [laedt, setLaedt] = useState(false);
    const [fehler, setFehler] = useState<string | null>(null);

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

    // Bewertungen erst beim ersten Aufklappen laden, damit nicht jede
    // Modulkarte direkt beim Rendern eine Anfrage abschickt
    const handleAufklappen = async () => {
        const wirdGeoeffnet = !open;
        setOpen(wirdGeoeffnet);
        if (!wirdGeoeffnet || geladen || laedt) return;

        setLaedt(true);
        setFehler(null);
        try {
            const daten = await ladeBewertungenAction(modulKey);
            setBewertungen(daten);
            setGeladen(true);
        } catch (e) {
            console.error("Bewertungen konnten nicht geladen werden:", e);
            setFehler("Bewertungen konnten nicht geladen werden.");
        } finally {
            setLaedt(false);
        }
    };

    const handleAbschicken = async (kategorien: KategorieBewertung, semester: string, kommentar: string) => {
        setFehler(null);
        try {
            const neueBewertung = await erstelleBewertungAction(modulKey, kategorien, semester, kommentar);
            if (neueBewertung) {
                setBewertungen((prev) => [neueBewertung, ...prev]);
            }
            setSchreibtBewertung(false);
        } catch (e) {
            console.error("Bewertung konnte nicht gespeichert werden:", e);
            setFehler("Bewertung konnte nicht gespeichert werden. Bitte versuche es erneut.");
            throw e; // ReviewForm behält dadurch die Eingaben
        }
    };

    const handleLoeschen = async (bewertungId: string) => {
        if (!window.confirm("Möchtest du deine Bewertung wirklich löschen?")) return;
        setFehler(null);
        try {
            await loescheBewertungAction(bewertungId);
            setBewertungen((prev) => prev.filter((b) => b.id !== bewertungId));
        } catch (e) {
            console.error("Bewertung konnte nicht gelöscht werden:", e);
            setFehler("Bewertung konnte nicht gelöscht werden. Bitte versuche es erneut.");
        }
    };

    return (
        <div className="flex flex-col">
            <button
                onClick={handleAufklappen}
                className="w-full flex items-center justify-between bg-[#E3E6EA] dark:bg-blue-bell rounded-xl px-4 py-3 hover:opacity-90 transition-opacity"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-black text-white rounded-full p-1.5">
                        <MessageSquare size={14}/>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">Studierenden-Feedback</span>
                        <span className="text-xs text-gray-500 dark:text-gray-100">
                            {geladen
                                ? `${bewertungen.length} Bewertung${bewertungen.length !== 1 ? "en" : ""} ansehen`
                                : "Bewertungen ansehen"}
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

                        {fehler && (
                            <p className="text-sm text-flag-red bg-flag-red/10 rounded-lg px-4 py-2">{fehler}</p>
                        )}

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
                            {laedt && (
                                <p className="text-sm text-gray-400">Bewertungen werden geladen...</p>
                            )}
                            {geladen && bewertungen.length === 0 && (
                                <p className="text-sm text-gray-400">
                                    Noch keine Bewertungen – schreib die erste!
                                </p>
                            )}
                            {sortierteBewertungen.map((bewertung) => (
                                <ReviewCard key={bewertung.id} bewertung={bewertung} onLoeschen={handleLoeschen}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulFeedback;
