"use client"

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createCustomModul } from '@/app/protected/modules/actions';
import { getSemesters } from '@/app/protected/planner/actions';
import ModulCustomJob from './modul-custom-job';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type FormData = {
    modulname: string,
    bereichspfad: string,
    ects: number,
    turnus: string,
    beschreibung: string,
    pruefungsform: string,
    benotet: boolean | null,
    arbeitsaufwand: number,
}

export default function ModulCustom({ isOpen, onClose }: Props) {
    const [mode, setMode] = useState<"modul" | "job">("modul");

    const [formData, setFormData] = useState<FormData>({
        modulname: "",
        bereichspfad: "",
        ects: 0,
        turnus: "",
        beschreibung: "",
        pruefungsform: "",
        benotet: null,
        arbeitsaufwand: 0,
    });

    // Semester des Nutzers laden
    const [semesterListe, setSemesterListe] = useState<{ id: string; semesterzahl: number; name: string }[]>([]);
    const [plannerOpen, setPlannerOpen] = useState(false);

    useEffect(() => {
        async function ladeSemester() {
            try {
                const data = await getSemesters();
                setSemesterListe(data ?? []);
            } catch (e) {
                console.error("Fehler beim Laden der Semester:", e);
            }
        }

        ladeSemester();
    }, []);

    if (!isOpen) return null;

    // Prüft ob alle Pflichtfelder für den aktuellen Modus ausgefüllt sind
    function istEingabeVollstaendig(): boolean {
        if (mode === "job") {
            return (
                formData.modulname.trim() !== "" &&
                formData.arbeitsaufwand > 0 &&
                formData.beschreibung.trim() !== ""
            );
        }

        return (
            formData.modulname.trim() !== "" &&
            formData.pruefungsform.trim() !== "" &&
            formData.ects > 0 &&
            formData.turnus !== "" &&
            formData.bereichspfad !== "" &&
            formData.benotet !== null &&
            formData.beschreibung.trim() !== ""
        );
    }

    const handleSubmit = async (semesterId: string) => {
        try {
            const modulId = await createCustomModul(
                formData.modulname,
                formData.bereichspfad,
                formData.ects,
                formData.turnus,
                formData.beschreibung,
                formData.pruefungsform,
                formData.benotet,
                formData.arbeitsaufwand,
                semesterId
            );

            console.log('Erstellte Modul-ID:', modulId);
            onClose();
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
        }
    };

    return (
        <>
            {/**Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/**Modal */}
            <div className='fixed left-0 md:left-72 right-0 bottom-0 max-h-[90vh] overflow-y-auto flex justify-items-stretch bg-white dark:bg-card z-50 gap-6 border-y-2 border-x-2 rounded-t-xl flex-col p-8'>
                <header className='flex w-full flex-row gap-6 items-center justify-between'>
                    <h1 className='flex font-bold md:text-2xl text-xl'>Custom Modul erstellen</h1>
                    <button onClick={onClose}>
                        <X className='flex flex-none w-4 h-4'></X>
                    </button>
                </header>

                {/**Switch von modul-custom erstellen zu job erstellen */}
                <div className='flex flex-col gap-6'>
                    <div className="relative flex border-b">
                        <button
                            className="flex-1 py-2 text-center"
                            onClick={() => setMode("modul")}>
                            Modul
                        </button>

                        <button
                            className="flex-1 py-2 text-center"
                            onClick={() => {
                                setMode("job");
                                setFormData(prev => ({
                                    ...prev,
                                    bereichspfad: "job",
                                    ects: 0,
                                    turnus: "",
                                    pruefungsform: "",
                                    benotet: false,
                                }));
                            }}>Job
                        </button>

                        <div
                            className={`absolute bottom-0 h-[2px] bg-flag-red transition-transform duration-300 w-1/2`}
                            style={{
                                transform: mode === "modul" ? "translateX(0%)" : "translateX(100%)",
                            }}
                        />
                    </div>

                    {mode === "modul" ? (
                        <>
                            {/** Modulname */}
                            <div className="flex rounded-lg border-x-2 border-y-2 border-border bg-white px-4 py-3 dark:bg-[#24112f]">
                                <input
                                    className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                                    placeholder="Wie heißt dein Modul?"
                                    value={formData.modulname}
                                    onChange={(e) =>
                                        setFormData({ ...formData, modulname: e.target.value })
                                    }
                                />
                            </div>

                            {/** Prüfungsform */}
                            <div className='flex gap-2 flex-col'>
                                <p className='font-bold text-[14px]'>Prüfungsform</p>
                                <div className="flex rounded-lg border-x-2 border-y-2 border-border bg-white px-4 py-3 dark:bg-[#24112f]">
                                    <input
                                        className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                                        placeholder="Wie wird das Modul geprüft?"
                                        value={formData.pruefungsform}
                                        onChange={(e) =>
                                            setFormData({ ...formData, pruefungsform: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className='flex gap-2 flex-col md:flex-row'>
                                {/** ECTS */}
                                <div>
                                    <p className='font-bold text-[14px]'>ECTS</p>
                                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                                        <input
                                            className="flex-1 w-full appearance-none bg-transparent leading-none text-gray-900 outline-none dark:text-white"
                                            type='number'
                                            value={formData.ects}
                                            onChange={(e) =>
                                                setFormData({ ...formData, ects: Number(e.target.value) })
                                            }
                                        />
                                    </div>
                                </div>

                                {/** turnus */}
                                <div>
                                    <p className='flex-1 font-bold text-[14px]'>Semester</p>
                                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                                        <select
                                            value={formData.turnus}
                                            onChange={(e) =>
                                                setFormData({ ...formData, turnus: e.target.value })
                                            }
                                            className="flex-1 w-full bg-transparent text-gray-900 outline-none dark:text-white">
                                            <option value="">Bitte wählen</option>
                                            <option value="WiSe">WiSe</option>
                                            <option value="SoSe">SoSe</option>
                                            <option value="WiSe/SoSe">WiSe/SoSe</option>
                                        </select>
                                    </div>
                                </div>

                                {/** Modulart */}
                                <div>
                                    <p className='flex-1 font-bold text-[14px]'>Modulart</p>
                                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                                        <select
                                            value={formData.bereichspfad}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bereichspfad: e.target.value })
                                            }
                                            className="w-full bg-transparent text-gray-900 outline-none dark:text-white">
                                            <option value="">Bitte wählen</option>
                                            <option value="Pflicht">Pflicht</option>
                                            <option value="Wahlpflicht">Wahlpflicht</option>
                                            <option value="Wahl">Wahl</option>
                                        </select>
                                    </div>
                                </div>

                                {/** benotet */}
                                <div>
                                    <p className='font-bold text-[14px]'>benotet?</p>
                                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                                        <select
                                            value={formData.benotet === null ? "" : String(formData.benotet)}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    benotet: e.target.value === "" ? null : e.target.value === "true",
                                                })
                                            }
                                            className="w-full bg-transparent text-gray-900 outline-none dark:text-white">
                                            <option value="">Bitte wählen</option>
                                            <option value="true">Ja</option>
                                            <option value="false">Nein</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/** Beschreibung */}
                            <div className='flex gap-2 flex-col'>
                                <p className='font-bold text-[14px]'>Beschreibung</p>
                                <div className="flex rounded-lg border-x-2 border-y-2 border-border bg-white px-4 py-3 dark:bg-[#24112f]">
                                    <input
                                        className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                                        placeholder="Hier kannst du dein Modul beschreiben"
                                        value={formData.beschreibung}
                                        onChange={(e) =>
                                            setFormData({ ...formData, beschreibung: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <ModulCustomJob formData={formData} setFormData={setFormData} />
                    )}

                    {/** Buttons */}
                    <div className='flex gap-2 flex-col md:flex-row items-center self-stretch'>
                        <button
                            onClick={onClose}
                            className="flex w-full items-center justify-center rounded-lg border-x-2 border-y-2 border-border bg-white px-4 py-3 font-bold text-gray-900 dark:bg-[#24112f] dark:text-white md:w-1/3">
                            abbrechen
                        </button>

                        <div className='w-full md:w-2/3 flex flex-col gap-2'>
                            <button
                                disabled={!istEingabeVollstaendig()}
                                className={`flex px-4 py-3 rounded-lg bg-violet-ray text-white w-full items-center justify-center ${
                                    !istEingabeVollstaendig() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                onClick={() => setPlannerOpen(!plannerOpen)}>
                                Zum Planer hinzufügen
                            </button>

                            {/** Aufklappbare Semester-Auswahl */}
                            {plannerOpen && istEingabeVollstaendig() && (
                                <div className='border-y-2 border-x-2 rounded-lg p-3 flex flex-col gap-1'>
                                    {semesterListe.length === 0 ? (
                                        <p className='text-sm text-gray-500 px-2 py-2'>
                                            Noch keine Semester angelegt. Lege zuerst im Planer ein Semester an.
                                        </p>
                                    ) : (
                                        semesterListe.map((sem) => (
                                            <button
                                                key={sem.id}
                                                onClick={() => handleSubmit(sem.id)}
                                                className='flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#16081f] transition-colors text-left'>
                                                <span className='font-medium'>{sem.name}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}