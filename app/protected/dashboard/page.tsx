import { createClient } from "@/lib/supabase/server";
import {
  getUserStudiengangId,
  ladeModulBasisAction,
} from "@/app/protected/modules/actions";
import {
  Shell,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  CircleCheckBig,
  Circle,
} from "lucide-react";
import {
  berechneGesamtschnitt,
  berechneUrteil,
} from "@/lib/grades";

type AktuellesModul = {
  name: string;
  prof: string;
  ects: number;
  laufend: boolean;
};

type Meilenstein = {
  titel: string;
  fortschritt: number;
};

function firstOrSingle<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-seitiger Auth-Aufruf, damit später nutzerspezifische Dashboarddaten geladen werden können.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notenModule } = user
    ? await supabase
        .from("module")
        .select("ects, note, gewichtung, benotet, abgeschlossen")
        .eq("user_id", user.id)
    : { data: [] };

  const gesamtschnitt = berechneGesamtschnitt(notenModule ?? []);
  const urteil = berechneUrteil(gesamtschnitt);

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("current_semester, max_semester")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: plannedModules } = user
    ? await supabase
        .from("planner")
        .select(`
          id,
          semester:group_id (
            id,
            name,
            semesterzahl
          ),
          module:modul_id (
            id,
            name,
            ects,
            abgeschlossen
          )
        `)
        .eq("user_id", user.id)
    : { data: [] };

  const studiengangId = await getUserStudiengangId();

  const modulBasis = studiengangId
    ? await ladeModulBasisAction(studiengangId)
    : [];

  // Dashboard zählt nur Module, die wirklich im Planer liegen.
  const plannedModuleItems = plannedModules ?? [];

  const modules = plannedModuleItems
    .map((item) => firstOrSingle(item.module))
    .filter(Boolean);


  // Aktuelles Semester ist das erste Planer-Semester, das noch offene Module enthält.
  const semesterAusPlaner = plannedModuleItems
    .map((item) => firstOrSingle(item.semester))
    .filter(Boolean);

  const eindeutigeSemester = Array.from(
    new Map(
      semesterAusPlaner.map((semester) => [semester?.semesterzahl, semester])
    ).values()
  ).sort((a, b) => (a?.semesterzahl ?? 0) - (b?.semesterzahl ?? 0));

  const aktuellesSemesterObjekt =
    eindeutigeSemester.find((semester) => {
      const moduleInSemester = plannedModuleItems.filter((item) => {
        const itemSemester = firstOrSingle(item.semester);
        return itemSemester?.semesterzahl === semester?.semesterzahl;
      });

      return moduleInSemester.some((item) => {
        const modul = firstOrSingle(item.module);
        return !modul?.abgeschlossen;
      });
    }) ??
    eindeutigeSemester[eindeutigeSemester.length - 1] ??
    null;

  const aktuellesSemester =
    aktuellesSemesterObjekt?.semesterzahl ?? profile?.current_semester ?? 1;

const gesamtEcts = 180;

const aktuelleEcts = modules
  .filter((modul) => modul?.abgeschlossen)
  .reduce((sum, modul) => sum + (modul?.ects ?? 0), 0);

const gesamtfortschritt = Math.min(
  100,
  Math.round((aktuelleEcts / gesamtEcts) * 100)
);
  const moduleImAktuellenSemester = plannedModuleItems.filter((item) => {
    const semester = firstOrSingle(item.semester);

    return semester?.semesterzahl === aktuellesSemester;
  });

  // Modul-Fortschritt zählt abgeschlossene Planer-Module.
  const abgeschlosseneModule = modules.filter(
    (modul) => modul?.abgeschlossen
  ).length;

  const moduleFortschritt =
    modules.length > 0
      ? Math.min(100, Math.round((abgeschlosseneModule / modules.length) * 100))
      : 0;

  // Semester-Fortschritt zählt nur Module aus dem aktuell offenen Semester.
  const abgeschlosseneModuleImAktuellenSemester =
    moduleImAktuellenSemester.filter((item) => {
      const modul = firstOrSingle(item.module);

      return modul?.abgeschlossen;
    }).length;

  const aktuellesSemesterFortschritt =
    moduleImAktuellenSemester.length > 0
      ? Math.min(
          100,
          Math.round(
            (abgeschlosseneModuleImAktuellenSemester /
              moduleImAktuellenSemester.length) *
              100
          )
        )
      : 0;

  const meilensteine: Meilenstein[] = [
    {
      titel: "Module abgeschlossen",
      fortschritt: moduleFortschritt,
    },
    
    {
      titel: "Aktuelles Semester",
      fortschritt: aktuellesSemesterFortschritt,
    },
  ];

const angezeigteModule: AktuellesModul[] =
  moduleImAktuellenSemester.length > 0
    ? moduleImAktuellenSemester.map((item) => {
        const modul = firstOrSingle(item.module);

        return {
          name: modul?.name ?? "Unbekanntes Modul",
          prof: "Planner",
          ects: modul?.ects ?? 0,
          laufend: !modul?.abgeschlossen,
        };
      })
    : modulBasis.slice(0, 3).map((modul) => ({
        name: modul.name,
        prof: "MOSES",
        ects: modul.lp,
        laufend: false,
      }));


  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
        <p className="text-sm text-muted-foreground">
          Verfolge deinen Weg zum Abschluss.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-[#C40D1F] p-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <Award className="h-6 w-6" />
            <h2 className="text-3xl font-bold">{gesamtfortschritt}%</h2>
          </div>

          <p className="text-sm">Gesamtfortschritt</p>

          <div className="mt-4 h-2 rounded-full bg-red-300">
            <div
              className="h-2 rounded-full bg-white"
              style={{ width: `${gesamtfortschritt}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-center dark:bg-card">
          <div className="flex items-center justify-between gap-4">
            <Shell className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">
                {aktuelleEcts}/{180}
              </h2>
              <p className="text-sm text-muted-foreground">ECTS</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-center dark:bg-card">
          <div className="flex items-center justify-between gap-4">
            <Calendar className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">{aktuellesSemester}</h2>
              <p className="text-sm text-muted-foreground">Semester</p>
            </div>
          </div>
        </div>

        

        <div className="rounded-2xl border border-border bg-white p-5 flex flex-col justify-center dark:bg-card">
          <div className="flex items-center justify-between gap-4">
            <TrendingUp className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">
                {gesamtschnitt !== null ? gesamtschnitt.toFixed(1) : "—"}
              </h2>
              <p className="text-sm text-muted-foreground">Gesamtschnitt</p>
              <p className="text-xs text-muted-foreground">{urteil}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 dark:bg-card sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Aktuelles Semester</h2>
          <p className="text-sm text-muted-foreground">
            {moduleImAktuellenSemester.length} Module
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {angezeigteModule.map((modul) => (
            <div
              key={modul.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 dark:bg-[#16081f] sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start"
            >
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  {modul.name}
                </h3>
                <p className="text-sm text-muted-foreground">{modul.prof}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:justify-end lg:justify-start">
                <p className="text-sm text-muted-foreground">
                  {modul.ects} ECTS
                </p>

                <span
                  className={`rounded-full px-4 py-1 text-sm ${
                    modul.laufend
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                      : "bg-red-100 text-red-600 dark:bg-flag-red/15 dark:text-red-300"
                  }`}
                >
                  {modul.laufend ? "Laufend" : "Abgeschlossen"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-4 flex flex-col justify-center dark:bg-card sm:p-5">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#C40D1F]" />
            <h2 className="text-xl font-bold">Meilensteine</h2>
          </div>

          <div className="mt-4 space-y-3">
            {meilensteine.map((meilenstein) => (
              <div
                key={meilenstein.titel}
                className="rounded-2xl border border-border bg-white p-4 dark:bg-[#16081f]"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {meilenstein.fortschritt >= 100 ? (
                      <CircleCheckBig className="h-5 w-5 shrink-0 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-gray-400 dark:text-muted-foreground" />
                    )}

                    <h3 className="font-medium">{meilenstein.titel}</h3>
                  </div>

                  <span className="shrink-0">{meilenstein.fortschritt}%</span>
                </div>

                <div className="h-2 rounded-full bg-gray-200 dark:bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      meilenstein.fortschritt >= 100
                        ? "bg-green-500"
                        : "bg-[#C40D1F]"
                    }`}
                    style={{ width: `${meilenstein.fortschritt}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}