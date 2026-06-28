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