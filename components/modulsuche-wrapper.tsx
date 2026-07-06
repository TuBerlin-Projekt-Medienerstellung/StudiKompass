"use client";

import { useState } from "react";
import MosesModulsuche from "./moses-module";
import ExtendedModulsuche from "./extended-modulsuche";

interface WrapperProps {
    studiengangId: number;
}

export default function ModulsucheWrapper({ studiengangId }: WrapperProps) {
    const [isExtendedMode, setIsExtendedMode] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            {/* Toggle Button */}
            <div className="flex w-full md:justify-end">
                <button
                    onClick={() => setIsExtendedMode(!isExtendedMode)}
                    className="px-4 py-2 rounded-2xl border-2 font-medium transition-colors bg-white text-black border-gray-200 hover:border-flag-red dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                >
                    {isExtendedMode ? "Zurück zur Basis-Suche" : "Zur Erweiterten Suche wechseln"}
                </button>
            </div>

            {/* Render the selected search mode */}
            {isExtendedMode ? (
                <ExtendedModulsuche />
            ) : (
                <MosesModulsuche studiengangId={studiengangId} />
            )}
        </div>
    );
}