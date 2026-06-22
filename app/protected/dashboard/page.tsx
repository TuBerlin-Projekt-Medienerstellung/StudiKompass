import Studiengangwahl from "@/components/studiengangwahl";
import { createClient } from "@/lib/supabase/server";
import {
  Shell,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  CircleCheckBig,
  Circle,
} from "lucide-react";

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

type DashboardStats = {
  gesamtfortschritt: number;
  aktuelleEcts: number;
  gesamtEcts: number;
  aktuellesSemester: number;
  abschlussSemester: string;
};

const dashboardStats: DashboardStats = {
  gesamtfortschritt: 90,
  aktuelleEcts: 103,
  gesamtEcts: 180,
  aktuellesSemester: 4,
  abschlussSemester: "SoSe 2027",
};

// Platzhalterdaten fuer aktuelle Module, bis echte Studiendaten angebunden werden koennen.
const aktuelleModule: AktuellesModul[] = [
  {
    name: "Lineare Algebra",
    prof: "Prof. Dr. Weber",
    ects: 5,
    laufend: true,
  },
  {
    name: "Programmierung",
    prof: "Prof. Dr. Beispiel",
    ects: 6,
    laufend: true,
  },
  {
    name: "Elektronik",
    prof: "Prof. Dr. KeineAhnung",
    ects: 4,
    laufend: false,
  },
];

// Platzhalterdaten fuer Meilensteine und Fortschrittsanzeigen.
const meilensteine: Meilenstein[] = [
  {
    titel: "Pflichtmodule abgeschlossen",
    fortschritt: 100,
  },
  {
    titel: "Wahlpflichtmodule",
    fortschritt: 75,
  },
  {
    titel: "Bachelorarbeit begonnen",
    fortschritt: 25,
  },
];


export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-seitiger Auth-Aufruf, damit spaeter nutzerspezifische Dashboarddaten geladen werden koennen.
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            <h2 className="text-3xl font-bold">
              {dashboardStats.gesamtfortschritt}%
            </h2>
          </div>

          <p className="text-sm">Gesamtfortschritt</p>

          <div className="mt-4 h-2 rounded-full bg-red-300">
            <div className="h-2 rounded-full bg-white"
            style={{ width: `${dashboardStats.gesamtfortschritt}%` }}
/>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <Shell className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold"> {dashboardStats.aktuelleEcts}/{dashboardStats.gesamtEcts} </h2>
              <p className="text-sm text-muted-foreground">ECTS</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <Calendar className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardStats.aktuellesSemester}
              </h2>
              <p className="text-sm text-muted-foreground">Semester</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <Clock className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">
                {dashboardStats.abschlussSemester}
              </h2>
              <p className="text-sm text-muted-foreground">Voraussichtlich</p>
            </div>
          </div>
        </div>
      </section>



    <section className="rounded-2xl border border-border bg-white dark:bg-card p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Aktuelles Semester</h2>
        <p className="text-sm text-muted-foreground">
          {aktuelleModule.length} Module
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {aktuelleModule.map((modul) => (
          <div
            key={modul.name}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-white dark:bg-[#16081f] p-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start"
          >
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                {modul.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {modul.prof}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end lg:justify-start">
              <p className="text-sm text-muted-foreground">
                {modul.ects} ECTS
              </p>

              <span
                className={`rounded-full px-4 py-1 text-sm ${
                  // Hier steuert der Modulstatus Farbe und Beschriftung des Badges.
                  modul.laufend
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-red-100 text-red-600 dark:bg-flag-red/15 dark:text-red-300"
                }`}
              >
                {modul.laufend ? "Laufend" : "Nicht laufend"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>



    <section className="rounded-2xl border border-border bg-white dark:bg-card p-4 sm:p-5 flex flex-col justify-center">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#C40D1F]" />
          <h2 className="text-xl font-bold">Meilensteine</h2>
        </div>

        <div className="mt-4 space-y-3">
          {meilensteine.map((meilenstein) => (
            <div
              key={meilenstein.titel}
              className="rounded-2xl border border-border bg-white dark:bg-[#16081f] p-4"
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {meilenstein.fortschritt >= 100 ? (
                    <CircleCheckBig className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-gray-400 dark:text-muted-foreground" />
                  )}

                  <h3 className="font-medium">
                    {meilenstein.titel}
                  </h3>
                </div>

                <span className="shrink-0">{meilenstein.fortschritt}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-200 dark:bg-muted">
                <div
                  className={`h-2 rounded-full ${
                    // Die Meilensteine, die abgeschlossen sind, werden visuell von offenen Schritten getrennt.
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


</div>);}
