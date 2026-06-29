"use client";

import {useState} from "react";
import {Send} from "lucide-react";
import StarRatingInput from "./ui/starrating-input";

interface ReviewFormProps {
    modulName: string;
    onAbbrechen: () => void;
    onAbschicken: (kategorien: KategorieBewertung, semester: string, kommentar: string) => void;
}

const semesterOptionen = ["SoSe 2026", "WiSe 2025/26", "SoSe 2025", "WiSe 2024/25", "SoSe 2024", "WiSe 2023/24"];

const initialeKategorien: KategorieBewertung = {
    dozent: 0,
    vorlesung: 0,
    tutorium: 0,
    aufwand: 0,
    organisation: 0,
};

const kategorieFelder: { key: keyof KategorieBewertung; label: string }[] = [
    {key: "dozent", label: "Dozent"},
    {key: "vorlesung", label: "Vorlesung"},
    {key: "tutorium", label: "Tutorium"},
    {key: "aufwand", label: "Aufwand"},
    {key: "organisation", label: "Organisation"},
];

const ReviewForm = ({modulName, onAbbrechen, onAbschicken}: ReviewFormProps) => {
    const [kategorien, setKategorien] = useState<KategorieBewertung>(initialeKategorien);
    const [semester, setSemester] = useState(semesterOptionen[0]);
    const [kommentar, setKommentar] = useState("");

    const setzeKategorie = (key: keyof KategorieBewertung, wert: number) => {
        setKategorien((prev) => ({...prev, [key]: wert}));
    };

    const istGueltig = Object.values(kategorien).every((wert) => wert > 0) && kommentar.trim().length > 0;

    const handleAbschicken = () => {
        if (!istGueltig) return;
        onAbschicken(kategorien, semester, kommentar.trim());
        setKategorien(initialeKategorien);
        setSemester(semesterOptionen[0]);
        setKommentar("");
    };

    return (
        <div className="border-2 border-flag-red/30 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="font-semibold flex items-center gap-2">
                <span className="text-amber-400">★</span>
                Deine Bewertung für „{modulName}“
            </h3>

            <div className="grid md:grid-cols-2 gap-3">
                {kategorieFelder.map(({key, label}) => (
                    <div key={key} className="bg-[#E3E6EA] rounded-lg px-4 py-3 flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <StarRatingInput value={kategorien[key]} onChange={(wert) => setzeKategorie(key, wert)}
                                         size={18}/>
                    </div>
                ))}
                <div className="bg-[#E3E6EA] rounded-lg px-4 py-3 flex items-center justify-between">
                    <span className="text-sm">Semester</span>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                    >
                        {semesterOptionen.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative">
                <textarea
                    value={kommentar}
                    onChange={(e) => setKommentar(e.target.value.slice(0, 500))}
                    placeholder="Teile deine Erfahrungen mit dem Modul..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-flag-red/50 resize-none"
                />
                <span className="absolute bottom-2 right-3 text-xs text-gray-400">{kommentar.length}/500</span>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={onAbbrechen}
                    className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    Abbrechen
                </button>
                <button
                    onClick={handleAbschicken}
                    disabled={!istGueltig}
                    className="bg-flag-red disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-opacity"
                >
                    <Send size={14}/>
                    Bewertung abschicken
                </button>
            </div>
        </div>
    );
};

export default ReviewForm;