export type ModulFuerSchnitt = {
  ects: number | null;
  note: number | null;
  gewichtung: number | null;
  benotet: boolean | null;
  abgeschlossen: boolean | null;
};

function getGewichtung(modul: ModulFuerSchnitt): number {
  return modul.gewichtung ?? 1;
}

function istRelevantesNotenModul(modul: ModulFuerSchnitt): boolean {
  const gewichtung = getGewichtung(modul);

  return (
    modul.abgeschlossen === true &&
    modul.benotet === true &&
    modul.note !== null &&
    modul.note >= 1.0 &&
    modul.note <= 4.0 &&
    modul.ects !== null &&
    modul.ects > 0 &&
    gewichtung > 0
  );
}

export function berechneGesamtschnitt(module: ModulFuerSchnitt[]) {
  const relevanteModule = module.filter(istRelevantesNotenModul);

  const gewichteteSumme = relevanteModule.reduce((summe, modul) => {
    const gewichtung = getGewichtung(modul);

    return summe + modul.note! * modul.ects! * gewichtung;
  }, 0);

  const gewichtSumme = relevanteModule.reduce((summe, modul) => {
    const gewichtung = getGewichtung(modul);

    return summe + modul.ects! * gewichtung;
  }, 0);

  if (gewichtSumme === 0) {
    return null;
  }

  const rohwert = gewichteteSumme / gewichtSumme;

  return Math.trunc(rohwert * 10) / 10;
}

export function berechneUrteil(note: number | null) {
  if (note === null) {
    return "Noch keine Gesamtnote";
  }

  if (note < 1.0 || note > 4.0) {
    return "Keine gültige Note";
  }

  if (note <= 1.5) return "sehr gut";
  if (note <= 2.5) return "gut";
  if (note <= 3.5) return "befriedigend";

  return "ausreichend";
}

export function berechneWunschschnittFortschritt(
  module: ModulFuerSchnitt[],
  zielnote: number | null,
  _gesamtEcts: number
): number {
  if (zielnote === null || zielnote < 1.0 || zielnote > 4.0) {
    return 0;
  }

  const aktuellerSchnitt = berechneGesamtschnitt(module);

  if (aktuellerSchnitt === null) {
    return 0;
  }

  if (aktuellerSchnitt <= zielnote) {
    return 100;
  }

  if (zielnote === 4.0) {
    return 100;
  }

  const fortschritt =
    ((4.0 - aktuellerSchnitt) / (4.0 - zielnote)) * 100;

  return Math.max(0, Math.min(100, Math.round(fortschritt)));
}