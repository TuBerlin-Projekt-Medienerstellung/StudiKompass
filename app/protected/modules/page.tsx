import CustomModulButton from "@/components/modul-custom-button";
import { getUserStudiengangId } from "@/app/protected/modules/actions";
import ModulsucheWrapper from "@/components/modulsuche-wrapper";

export default async function ModulesPage() {
  const studiengangId = await getUserStudiengangId();

  return (
    <section className="flex flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="w-full text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">Modulkatalog</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Durchsuche und verwalte verfügbare Module.
          </p>
        </div>

        <CustomModulButton />
      </header>

      <div className="rounded-2xl border border-border bg-white p-4 dark:bg-card sm:p-5 lg:p-6">
        {studiengangId ? (
          <ModulsucheWrapper studiengangId={studiengangId} />
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-border sm:p-10">
            <p className="text-sm text-muted-foreground sm:text-base">
              Bitte wähle zuerst einen Studiengang in deinen Einstellungen aus,
              um den Modulkatalog zu laden.
            </p>
          </div>
        )}
      </div>
    </section>
  );
<<<<<<< HEAD
}
=======
}
//modify
>>>>>>> f5c9d3edb044a491372dc86e03505cd8d4dbfd0d
