"use client"

import { X } from 'lucide-react';
import { useState } from 'react';
import { createCustomModul } from '@/app/protected/modules/actions';
import ModulCustomJob from './modul-custom-job';

type Props = {
  isOpen: boolean;
  onClose: () => void;};

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
  if (!isOpen) return null;

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
    
    //speichern der Eingaben
    const handleSubmit = async () => {
    try {
        const modulId = await createCustomModul(
        formData.modulname,
        formData.bereichspfad,
        formData.ects,
        formData.turnus,
        formData.beschreibung,
        formData.pruefungsform,
        formData.benotet,
        formData.arbeitsaufwand
        );

        console.log('Erstellte Modul-ID:', modulId);

        onClose(); // Modal schließen
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
        <div className='fixed left-0 md:left-72 right-0 bottom-0 flex justify-items-stretch bg-white  z-50 gap-6 border-y-2 border-x-2 rounded-t-xl flex-col p-8'>
            <header className='flex w-full bg-white flex-row gap-6 items-center justify-between'>
                <h1 className='flex font-bold md:text-2xl text-xl'>Custom Modul erstellen</h1>
                <button onClick={onClose}>
                    <X className='flex flex-none w-4 h-4'></X>
                </button>
                
            </header>
            <div className='flex flex-col gap-6'>
                <div className="relative flex border-b">
  
  <button
    className="flex-1 py-2 text-center"
    onClick={() => setMode("modul")}
  >
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
  }}>
  Job
  </button>
  

  <div
  className={`absolute bottom-0 h-[2px] bg-flag-red transition-transform duration-300 w-1/2`}
  style={{
    transform: mode === "modul" ? "translateX(0%)" : "translateX(100%)",
  }}
    /></div>
                     {mode === "modul" ? (
                    <>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        <input
                            className="w-full outline-none"
                            placeholder="Wie heißt dein Modul?"
                            value={formData.modulname}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                modulname: e.target.value,
                                })
                            }
                        />
                    </div>
                
            
                 
                <div className='flex gap-2 flex-col'>
                    <p className='font-bold text-[14px]'>Prüfungsform</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        <input
                            className="w-full outline-none"
                            placeholder="Wie wird das Modul geprüft?"
                            value={formData.pruefungsform}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                pruefungsform: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            
                
            <div className='flex gap-2 flex-col md:flex-row'>
                <div>
                    <p className='font-bold text-[14px]'>ECTS</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        <input
                            className="flex-1 appearance-none leading-none outline-none w-full outline-none"
                            type='number'
                            value={formData.ects}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                ects: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                </div>
                <div>
                    <p className='flex-1 font-bold text-[14px]'>Semester</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        <select
                        value={formData.turnus}
                        onChange={(e) =>
                            setFormData({
                            ...formData,
                            turnus: e.target.value,
                            })
                        }
                        className="flex-1 w-full bg-transparent outline-none"
                        >
                        <option value="">Bitte wählen</option>
                        <option value="1">WiSe</option>
                        <option value="2">SoSe</option>
                        <option value="3">WiSe/SoSe</option>
                        </select>
                    </div>
                </div>
                <div>
                    <p className='flex-1 font-bold text-[14px]'>Modulart</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        <select
                        value={formData.bereichspfad}
                        onChange={(e) =>
                            setFormData({
                            ...formData,
                            bereichspfad: e.target.value,
                            })
                        }
                        className="w-full bg-transparent outline-none"
                        >
                        <option value="">Bitte wählen</option>
                        <option value="1">Pflicht</option>
                        <option value="2">Wahlpflicht</option>
                        <option value="3">Wahl</option>
                        </select>
                    </div>
                </div>
                <div>
                    <p className='font-bold text-[14px]'>benotet?</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        <select
                        value={formData.benotet === null ? "" : String(formData.benotet)}
                        onChange={(e) =>
                            setFormData({
                            ...formData,
                            benotet:
                                e.target.value === ""
                                ? null
                                : e.target.value === "true",
                            })
                        }
                        className="w-full bg-transparent outline-none"
                        >
                        <option value="">Bitte wählen</option>
                        <option value="true">Ja</option>
                        <option value="false">Nein</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className='flex gap-2 flex-col'>
                <p className='font-bold text-[14px]'>Beschreibung</p>
                <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                    <input
                            className="w-full outline-none"
                            placeholder="Hier kannst du dein Modul beschreiben"
                            value={formData.beschreibung}
                            onChange={(e) =>
                                setFormData({
                                ...formData,
                                beschreibung: e.target.value,
                                })
                            }
                        />
                </div>
            </div>
            </>
            ):(<ModulCustomJob
                formData={formData}
                setFormData={setFormData}
                />)}
                
            <div className='flex gap-2 flex-col md:flex-row items-center align-items self-stretch'>
                <button onClick={onClose}
                        className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg font-bold w-full md:w-1/3 items-center justify-center'>
                    abbrechen
                </button>
                <button className='flex px-4 py-3 rounded-lg bg-violet-ray text-white w-full md:w-2/3 items-center justify-center'
                        onClick={handleSubmit}>
                    Zum Planer hinzufügen
                </button>   
            </div>
            
            
            </div>
        </div>
        
        </>
    )
}

