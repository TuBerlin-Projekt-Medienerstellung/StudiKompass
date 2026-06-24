import { Plus } from "lucide-react";
import { getUserStudiengangId } from "@/app/protected/modules/actions";

export default async function ModulesPage() {
  const studiengangId = await getUserStudiengangId();

  return (
    <section className="flex flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="w-full text-left">
          <h1 className="text-3xl font-bold">Modulkatalog</h1>
          <p className="text-sm text-muted-foreground">
            Durchsuche und verwalte verfügbare Module.
          </p>
        </div>

        <button className="hidden h-11 w-64 items-center justify-center gap-2 rounded-2xl bg-flag-red px-3 font-bold text-white md:flex">
          <Plus className="h-5 w-5" />
          Custom-Modul erstellen
        </button>
      </header>

      <div className="flex justify-end md:hidden">
        <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-flag-red text-white">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 dark:bg-card sm:p-5">
        {studiengangId ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center sm:p-10 dark:border-border">
            <p className="text-sm text-muted-foreground">
              Der Modulkatalog wird später hier geladen.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center sm:p-10 dark:border-border">
            <p className="text-sm text-muted-foreground">
              Bitte wähle zuerst einen Studiengang in deinen Einstellungen aus,
              um den Modulkatalog zu laden.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}