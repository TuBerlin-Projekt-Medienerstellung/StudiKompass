// 1. Importiere deine neue Moses-Suche und die Action!
import MosesModulsuche from '@/components/moses-module'; // (Passe den Pfad an, falls die Datei anders heißt)
import CustomModulButton from '@/components/modul-custom-button';
import { getUserStudiengangId } from '@/app/protected/modules/actions';

// 2. Mach die Seite "async", damit wir auf die Datenbank warten können
export default async function ModulesPage() {
    
    // 3. Hol die Studiengang-ID des eingeloggten Users
    const studiengangId = await getUserStudiengangId();
    return (
        <section className="flex flex-col gap-3">
            <header className="flex md:justify-between md:flex-row flex-col items-center md:items-start gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Modulkatalog</h1>
                    <p>Durchsuche und Verwalte verfügbare Module</p>
                </div>
                <CustomModulButton></CustomModulButton>
            </header>

            

            <div className="mt-6">
                {/* 4. Wenn der User eine ID hat, lade die echte Moses-Komponente.
                  Wenn nicht, zeige eine nette Fehlermeldung.
                */}
                {studiengangId ? (
                    <MosesModulsuche studiengangId={studiengangId} />
                ) : (
                    <div className="p-10 text-center border-2 border-dashed rounded-2xl border-gray-300">
                        <p className="opacity-60">
                            Bitte wähle zuerst einen Studiengang in deinen Einstellungen aus, 
                            um den Modulkatalog zu laden.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
