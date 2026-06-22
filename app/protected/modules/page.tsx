import ModulCard from "@/components/modul-card";
import {Plus, Search, Funnel} from 'lucide-react';
import {modulInfo} from "@/constants";

export default function ModulesPage() {
    return (
        <section className="flex flex-col gap-3">
            <header className="flex md:justify-between md:flex-row flex-col items-center md:items-start gap-6">
                <div className="w-full text-left">
                    <h1 className="text-2xl font-bold">Modulkatalog</h1>
                    <p>Durchsuche und Verwalte verfügbare Module</p>
                </div>
                <button
                    className="hidden md:flex bg-flag-red font-bold gap-2 text-white justify-center items-center px-3 rounded-2xl w-64 h-11">
                    <Plus/>
                    Costum-Modul
                </button>
            </header>

            <div className="flex flex-col gap-4 md:flex-row">
                <div
                    className="focus-within:border-blue-bell transition-colors border-2 rounded-2xl flex w-full md:flex-1 py-3 px-5 gap-3 pointer-events-auto">
                    <label htmlFor="search"> <Search/></label>
                    <input className="w-full focus:outline-none" type="text" id="search"
                           placeholder="Module durchsuchen"/>
                </div>

                <div className="flex gap-4">
                    <button
                        className="flex md:hidden bg-flag-red text-white justify-center items-center rounded-2xl w-12 h-12 shrink-0">
                        <Plus/>
                    </button>

                    <div className="border-2 rounded-2xl py-3 px-5 flex flex-1 md:w-auto">
                        <label htmlFor="types"> <Funnel/></label>
                        <select className="focus:outline-none w-full" name="types" id="types">
                            <option value="Elektronik">Elektronik</option>
                            <option value="Informatik">Informatik</option>
                            <option value="Mathematik">Mathematik</option>
                        </select>
                    </div>

                    <div className="border-2 rounded-2xl py-3 px-5 flex flex-1 md:w-auto">
                        <label htmlFor="kindOfModul"> <Funnel/></label>
                        <select className="focus:outline-none w-full" name="kindOfModul" id="kindOfModul">
                            <option value="Pflichtmodul">Pflichtmodul</option>
                            <option value="Wahlpflichtmodul">Wahlpflichtmodul</option>
                            <option value="Wahlmodul">Wahlmodul</option>
                        </select>
                    </div>
                </div>
            </div>

            {/** Hier drüber iterieren **/}
            <div className="w-full flex flex-col gap-4">
                {modulInfo.map((info, index) =>
                    <ModulCard key={index} {...info}/>
                )}
            </div>

        </section>
    );
}