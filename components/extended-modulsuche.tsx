"use client";

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ladeModulBasisByIdsAction, ModulBasis } from '@/app/protected/modules/actions';
import ModulCard from '@/components/modul-card';
import { getSemesters, getProfilTurnus } from '@/app/protected/planner/actions';
import { ListRestart } from 'lucide-react';

interface DictionaryItem {
  id: string;
  de_name: string;
  en_name: string;
  studiengänge: { name: string; stupo: string }[];
  lehrinhalt: string;
  words: string[];
}

export default function ExtendedModulsuche() {
    const [query, setQuery] = useState("");
    const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
    const [isLoadingDict, setIsLoadingDict] = useState(true);
    
    const [displayModules, setDisplayModules] = useState<ModulBasis[]>([]);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [currentSemester, setCurrentSemester] = useState<number | null>(null);
    const [currentTurnus, setCurrentTurnus] = useState<string | null>(null);
    const [semesterListe, setSemesterListe] = useState<{ id: string; semesterzahl: number; name: string }[]>([]);

    // Load semesters and python dict from supabase on mount
    useEffect(() => {
        async function initData() {
            // Load Semesters
            try {
                const semesters = await getSemesters();
                setSemesterListe(semesters ?? []);
            } catch (e) {
                console.error(e);
            }
            try {
                const { currentSemester, currentTurnus } = await getProfilTurnus();
                setCurrentSemester(currentSemester);
                setCurrentTurnus(currentTurnus);
            } catch (e) {
                console.error("Fehler beim Laden des Turnus:", e);
            }

            // Load Supabase json
            try {
                const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('https://', '').split('.')[0];
                const url = `https://${projectId}.supabase.co/storage/v1/object/public/module-data/modules_dictionary.json`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setDictionary(data);
                }
            } catch (error) {
                console.error("Failed to load extended dictionary", error);
            } finally {
                setIsLoadingDict(false);
            }
        }
        initData();
    }, []);

    // Initialize Fuse.js dynamically
    const fuse = useMemo(() => {
        if (dictionary.length === 0) return null;
        return new Fuse(dictionary, {
            keys: [
                { name: 'id', weight: 1.2 },
                { name: 'de_name', weight: 1.0 },
                { name: 'en_name', weight: 1.0 },
                { name: 'words', weight: 0.8 }
            ],
            threshold: 0.3,
            ignoreLocation: true,
        });
    }, [dictionary]);

    // Execute Search
    async function handleSearch(e: React.SubmitEvent) {
        e.preventDefault();
        if (!fuse || !query.trim()) return;

        setIsFetchingDetails(true);
        
        // Get matches from Fuse.js
        const results = fuse.search(query);
        const matchedData = results.slice(0, 30).map(res => ({
            id: res.item.id,
            name: res.item.de_name,
            studiengaenge: res.item.studiengänge
        }));
        const payload = matchedData.map(item => ({
            id: item.id,
            name: item.name,
            // Pass the first stupo year, or an empty string as a fallback, to satisfy 'stupo_year: string'
            stupo_year: item.studiengaenge.length > 0 ? item.studiengaenge[0].stupo : ""
        }));
        
        if (matchedData.length > 0) {
            try {
                const fetchedModules = await ladeModulBasisByIdsAction(payload);
                const modules_stupo= fetchedModules.map(modul => {
                    const match = matchedData.find(m => m.id === modul.id.value); 
                    return {...modul, studiengaengeInfo: match ? match.studiengaenge : [] };
                });
                console.log("Fetched Modules from Action:", fetchedModules);
                setDisplayModules(modules_stupo);
            } catch (error) {
                console.error("Error fetching module details by IDs", error);
            }
        } else {
            setDisplayModules([]);
        }
        
        setIsFetchingDetails(false);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card border-y-2 border-x-4 border-border border-l-grey border-r-grey p-6 rounded-xl">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <label className="block text-base font-semibold">
                        Erweiterte Modulsuche (Stichworte, Inhalte, Namen)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isLoadingDict ? "Lade Suchindex..." : "z.B. Data Science, 5071, Python..."}
                            disabled={isLoadingDict}
                            className="w-full bg-zinc-200 dark:bg-zinc-800 border border-grey rounded-lg px-4 py-2 outline-none"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoadingDict || isFetchingDetails}
                            className="bg-flag-red text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                            {isFetchingDetails ? "Sucht..." : "Suchen"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Render Results using existing ModulCard */}
            <div className="w-full flex flex-col gap-4">
                {displayModules.map((modul, index) => (
                    <ModulCard
                        key={`${modul.id.value}-${index}`}
                        modul_id={modul.id}
                        name={modul.name}
                        leistungspunkte={modul.lp}
                        bereichpfad={modul.bereichPfad[0] ?? "—"} 
                        link={''}
                        turnus={modul.semester}
                        lernergebnisse=''
                        pruefungsform=''
                        benotet={false}
                        arbeitsaufwand={0}
                        semesterListe={semesterListe}
                        currentSemester={currentSemester}
                        currentTurnus={currentTurnus}
                    />
                ))}
                {displayModules.length === 0 && !isFetchingDetails && query && (
                    <p className="text-center opacity-50 py-10">Keine passenden Module gefunden.</p>
                )}
            </div>
        </div>
    );
}