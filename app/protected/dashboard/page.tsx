import Studiengangwahl from "@/components/studiengangwahl";
import { createClient } from "@/lib/supabase/server";
import { Shell, Award, Calendar, Clock, TrendingUp, CircleCheckBig, Circle } from "lucide-react"; //Importieren von Lucide-Icons

// Werte und Daten für Module (bitte nachträglich richtige Werte einsetzen)
const aktuelleModule = [
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

//Werte für "Meilensteine"
const meilensteine = [
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
        <p className="text-sm text-gray-500">
          Verfolge deinen Weg zum Abschluss.
        </p>
      </div>



      <section className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#C40D1F] p-4 text-white">
          <div className="flex items-center justify-between">
            <Award className="h-6 w-6" />
            <h2 className="text-3xl font-bold">57%</h2>
          </div>

          <p className="text-sm">Gesamtfortschritt</p>

          <div className="mt-4 h-2 rounded-full bg-red-300">
            <div className="h-2 w-[57%] rounded-full bg-white" />
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Shell className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">103/180</h2>
              <p className="text-sm text-gray-500">ECTS</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Calendar className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">4</h2>
              <p className="text-sm text-gray-500">Semester</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <Clock className="h-6 w-6 text-[#C40D1F]" />
            <div>
              <h2 className="text-xl font-bold">SS 2027</h2>
              <p className="text-sm text-gray-500">Voraussichtlich</p>
            </div>
          </div>
        </div>
      </section>



    <section className="rounded-2xl border bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Aktuelles Semester</h2>
        <p className="text-sm text-gray-500">
          {aktuelleModule.length} Module
        </p>
      </div>

      <div className="space-y-3">
        {aktuelleModule.map((modul) => (
          <div
            key={modul.name}
            className="flex items-center justify-between rounded-2xl border bg-white p-4"
          >
            <div>
              <h3 className="text-base font-medium text-gray-900">
                {modul.name}
              </h3>
              <p className="text-sm text-gray-500">
                {modul.prof}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <p className="text-sm text-gray-500">
                {modul.ects} ECTS
              </p>

              <span
                className={`rounded-full px-4 py-1 text-sm ${
                  modul.laufend
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {modul.laufend ? "Laufend" : "Nicht laufend"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>



    <section className="rounded-2xl border bg-white p-5 flex flex-col justify-center">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#C40D1F]" />
          <h2 className="text-xl font-bold">Meilensteine</h2>
        </div>

        <div className="mt-4 space-y-3">
          {meilensteine.map((meilenstein) => (
            <div
              key={meilenstein.titel}
              className="rounded-2xl border bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {meilenstein.fortschritt >= 100 ? (
                    <CircleCheckBig className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}

                  <h3 className="font-medium">
                    {meilenstein.titel}
                  </h3>
                </div>

                <span>{meilenstein.fortschritt}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-200">
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


</div>);}