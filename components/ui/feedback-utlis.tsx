const leereKategorien: KategorieBewertung = {
    dozent: 0,
    vorlesung: 0,
    tutorium: 0,
    aufwand: 0,
    organisation: 0,
};

export function berechneKategorieDurchschnitt(bewertungen: Bewertung[]): KategorieBewertung {
    if (bewertungen.length === 0) return leereKategorien;

    const summe = bewertungen.reduce<KategorieBewertung>(
        (acc, b) => ({
            dozent: acc.dozent + b.kategorien.dozent,
            vorlesung: acc.vorlesung + b.kategorien.vorlesung,
            tutorium: acc.tutorium + b.kategorien.tutorium,
            aufwand: acc.aufwand + b.kategorien.aufwand,
            organisation: acc.organisation + b.kategorien.organisation,
        }),
        {...leereKategorien}
    );

    const n = bewertungen.length;
    return {
        dozent: summe.dozent / n,
        vorlesung: summe.vorlesung / n,
        tutorium: summe.tutorium / n,
        aufwand: summe.aufwand / n,
        organisation: summe.organisation / n,
    };
}

export function berechneGesamtScore(bewertungen: Bewertung[]): number {
    if (bewertungen.length === 0) return 0;
    return bewertungen.reduce((summe, b) => summe + b.gesamtScore, 0) / bewertungen.length;
}

export function berechneVerteilung(bewertungen: Bewertung[]): Record<VerteilungsStufe, number> {
    const verteilung: Record<VerteilungsStufe, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    bewertungen.forEach((b) => {
        const stufe = Math.min(5, Math.max(1, Math.round(b.gesamtScore))) as VerteilungsStufe;
        verteilung[stufe]++;
    });
    return verteilung;
}

export function initialenAusName(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((teil) => teil[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

const avatarFarben = [
    "bg-rose-100 text-rose-600",
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
    "bg-violet-100 text-violet-600",
];

export function avatarFarbe(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarFarben[Math.abs(hash) % avatarFarben.length];
}