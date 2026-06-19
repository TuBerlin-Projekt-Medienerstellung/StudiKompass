"use client"

import React, { use } from 'react'
import { X } from 'lucide-react';
import {useState, useEffect} from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;};



const ModulCustom = () => {
    return (
        <div className='fixed left-0 md:left-72 right-0 bottom-0 flex justify-items-stretch bg-white gap-6 border-y-2 border-x-2 rounded-t-xl flex-col p-8'>
            <header className='flex w-full bg-white flex-row gap-6 items-center justify-between'>
                <h1 className='flex font-bold md:text-2xl text-xl'>Custom Modul erstellen</h1>
                <X className='flex flex-none w-4 h-4'></X>
            </header>
            <div className='flex flex-col gap-6'>
                <div className='flex gap-2 flex-col'>
                    <p className='font-bold text-[14px]'>Modulname</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        Eingabe
                    </div>
                </div>
            
                <div className='flex gap-2 flex-col'>
                    <p className='font-bold text-[14px]'>Universität</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                        Eingabe
                    </div>
                </div>
            
                
            <div className='flex gap-2 flex-col md:flex-row'>
                <div>
                    <p className='font-bold text-[14px]'>ECTS</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        Eingabe 
                    </div>
                </div>
                <div>
                    <p className='font-bold text-[14px]'>Semester</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        Dropdown
                    </div>
                </div>
                <div>
                    <p className='font-bold text-[14px]'>Modulart</p>
                    <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg w-full justify-between'>
                        Dropdown
                    </div>
                </div>
            </div>

            <div className='flex gap-2 flex-col'>
                <p className='font-bold text-[14px]'>Beschreibung</p>
                <div className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg'>
                    Eingabe 
                </div>
            </div>
                
            <div className='flex gap-2 flex-col md:flex-row items-center align-items self-stretch'>
                <button className='flex px-4 py-3 border-y-2 border-x-2 rounded-lg font-bold w-full md:w-1/3 items-center justify-center'>
                    abbrechen
                </button>
                <button className='flex px-4 py-3 rounded-lg bg-violet-ray text-white w-full md:w-2/3 items-center justify-center'>
                    Zum Planer hinzufügen
                </button>   
            </div>
            
            
            </div>
        </div>
    )
}
export default ModulCustom
