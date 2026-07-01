//Ausgelagerter button, der das Custom-Modul öffnet, weil die modul page server-seitig ist
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ModulCustom from '@/components/modul-custom';

export default function CustomModulButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex bg-flag-red text-white justify-center items-center px-3 rounded-2xl w-64 h-11"
      >
        <Plus />
        Custom-Modul erstellen
      </button>

      {open && (
        <ModulCustom
            isOpen={open}
            onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}