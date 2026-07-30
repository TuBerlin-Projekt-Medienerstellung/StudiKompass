export type ModulFuerSchnitt = {
  ects: number | null;
  note: number | null;
  gewichtung: number | null;
  benotet: boolean | null;
  abgeschlossen: boolean | null;
};

export function berechneGesamtschnitt(module: ModulFuerSchnitt[]) {
  const relevanteModule = module.filter((modul) => {
    return (
      modul.abgeschlossen === true &&
      modul.benotet === true &&
      modul.note !== null &&
      (modul.gewichtung === 1 || modul.gewichtung === null) &&
      modul.ects !== null &&
      modul.ects > 0
    );
  });

  const gewichteteSumme = relevanteModule.reduce((summe, modul) => {
    return summe + modul.note! * modul.ects!;
  }, 0);

  const ectsSumme = relevanteModule.reduce((summe, modul) => {
    return summe + modul.ects!;
  }, 0);

  if (ectsSumme === 0) {
    return null;
  }

  const rohwert = gewichteteSumme / ectsSumme;

  return Math.trunc(rohwert * 10) / 10;
}

export function berechneUrteil(note: number | null) {
  if (note === null) return "Noch keine Gesamtnote";

  if (note >= 1.0 && note <= 1.5) return "sehr gut";
  if (note >= 1.6 && note <= 2.5) return "gut";
  if (note >= 2.6 && note <= 3.5) return "befriedigend";
  if (note >= 3.6 && note <= 4.0) return "ausreichend";

  return "Keine gültige Note";
}

export function berechneWunschschnittFortschritt(
  module: ModulFuerSchnitt[],
  zielnote: number | null,
  gesamtEcts: number
): number {
  if (zielnote === null) return 0;

  const benoteteModule = module.filter((modul) => {
    return (
      modul.abgeschlossen === true &&
      modul.benotet === true &&
      modul.note !== null &&
      modul.ects !== null &&
      modul.ects > 0 &&
      modul.gewichtung === 1
    );
  });

  const erreichteEcts = benoteteModule.reduce((summe, modul) => {
    return summe + modul.ects!;
  }, 0);

  const notensumme = benoteteModule.reduce((summe, modul) => {
    return summe + modul.note! * modul.ects!;
  }, 0);

  const restEcts = gesamtEcts - erreichteEcts;

  if (erreichteEcts === 0) {
    return 0;
  }

  if (restEcts <= 0) {
    const schnitt = notensumme / erreichteEcts;
    return schnitt <= zielnote ? 100 : 0;
  }

  const benoetigteNotensumme = zielnote * gesamtEcts;

  const benoetigteRestnote =
    (benoetigteNotensumme - notensumme) / restEcts;

  if (benoetigteRestnote >= 4.0) return 100;
  if (benoetigteRestnote <= 1.0) return 0;

  const fortschritt =
    ((benoetigteRestnote - 1.0) / 3.0) * 100;

  return Math.max(0, Math.min(100, Math.round(fortschritt)));
}