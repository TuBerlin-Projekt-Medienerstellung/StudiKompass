import ModulCard from "@/components/modul-card";
import {Plus, Search, Funnel} from 'lucide-react';
import {modulInfo} from "@/constants";

export default function ModulesPage() {
    return (
        <section className="flex flex-col gap-3">
            <header className="flex md:justify-between md:flex-row flex-col items-center md:items-start gap-6">
                <div>
                    <h1 className="text-2xl font-bold">Modulkatalog</h1>
                    <p>Durchsuche und Verwalte verfügbare Module</p>
                </div>
                <button
                    className="flex bg-flag-red text-white justify-center items-center px-3 rounded-2xl w-64 h-11">
                    <Plus/>
                    Costum-Modul erstellen
                </button>
            </header>


            <div className="flex flex-row gap-4">
                <div
                    className="focus-within:border-blue-bell transition-colors border-2 rounded-2xl flex flex-2 py-3 px-5 gap-3 pointer-events-auto">
                    <label htmlFor="search"> <Search/></label>
                    <input className="w-full focus:outline-none" type="text" id="search"
                           placeholder="Module durchsuchen"/>
                </div>
                {/*<div className="border-2 rounded-2xl py-3 px-5 flex">*/}
                {/*    <label htmlFor="types"> <Funnel/></label>*/}
                {/*    <select className="focus:outline-none" name="types" id="types">*/}
                {/*        <option value="Elektronik">Elektronik</option>*/}
                {/*        <option value="Informatik">Informatik</option>*/}
                {/*        <option value="Mathematik">Mathematik</option>*/}
                {/*    </select>*/}
                {/*</div>*/}
                <div className="border-2 rounded-2xl py-3 px-5 flex">
                    <label htmlFor="kindOfModul"> <Funnel/></label>
                    <select className="focus:outline-none" name="kindOfModul" id="kindOfModul">
                        <option value="Pflichtmodul">Pflichtmodul</option>
                        <option value="Wahlpflichtmodul">Wahlpflichtmodul</option>
                        <option value="Wahlmodul">Wahlmodul</option>
                    </select>
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