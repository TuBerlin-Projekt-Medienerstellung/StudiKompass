import StarRatingDisplay from "./ui/starrating-display";
import RatingVerteilung from "./ui/rating-verteilung";
import KategorieBar from "./ui/kategorie-bar";

interface FeedbackSummaryProps {
    gesamtScore: number;
    anzahlBewertungen: number;
    verteilung: Record<VerteilungsStufe, number>;
    kategorieDurchschnitt: KategorieBewertung;
}

const kategorieLabels: { key: keyof KategorieBewertung; label: string }[] = [
    {key: "dozent", label: "Dozent"},
    {key: "vorlesung", label: "Vorlesung"},
    {key: "tutorium", label: "Tutorium"},
    {key: "aufwand", label: "Aufwand"},
    {key: "organisation", label: "Organisation"},
];

const FeedbackSummary = ({
                             gesamtScore,
                             anzahlBewertungen,
                             verteilung,
                             kategorieDurchschnitt,
                         }: FeedbackSummaryProps) => {
    return (
        <div className="flex gap-4 md:flex-row flex-col">
            <div className="bg-[#161A23] rounded-2xl p-5 w-full md:w-2/5 flex flex-col">
                <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-white">{gesamtScore.toFixed(1)}</span>
                    <StarRatingDisplay value={gesamtScore} size={18} className="mb-1.5"/>
                </div>
                <span className="text-xs text-gray-400 mt-1">
                    {anzahlBewertungen} Bewertung{anzahlBewertungen !== 1 ? "en" : ""}
                </span>
                <RatingVerteilung verteilung={verteilung} gesamtAnzahl={anzahlBewertungen}/>
            </div>

            <div className="bg-[#E3E6EA] rounded-2xl p-5 w-full md:w-3/5 flex flex-col justify-center gap-3">
                <span className="text-xs font-semibold tracking-wide text-gray-500">NACH KATEGORIEN</span>
                {kategorieLabels.map(({key, label}) => (
                    <KategorieBar key={key} label={label} wert={kategorieDurchschnitt[key]}/>
                ))}
            </div>
        </div>
    );
};

export default FeedbackSummary;