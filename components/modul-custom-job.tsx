"use client"

import {X} from 'lucide-react';
import React, {useState} from 'react';
import {createCustomModul} from '@/app/protected/modules/actions';


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

type Props = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

export default function ModulCustomJob({formData, setFormData}: Props) {

    return (

        <>
            <div className='flex flex-col gap-6'>
                <div className='flex gap-2 flex-col'>
                    <p className='font-bold text-[14px]'>Name</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        <input
                            className="w-full outline-none"
                            placeholder="Wie heißt dein Job?"
                            value={formData.modulname}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    modulname: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>


                <div className='flex gap-2 flex-col md:flex-row'>
                    <div>
                        <p className='font-bold text-[14px]'>Stunden pro Woche</p>
                        <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                            <input
                                className="flex-1 appearance-none leading-none outline-none w-full outline-none"
                                type='number'
                                value={formData.arbeitsaufwand}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        arbeitsaufwand: Number(e.target.value),
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className='flex gap-2 flex-col'>
                    <p className='font-bold text-[14px]'>Beschreibung</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        <input
                            className="w-full outline-none"
                            placeholder="Hier kannst du deinen Job beschreiben"
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


            </div>
        </>
    )
}

