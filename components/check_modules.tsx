"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type Check_status = "UP_TO_DATE" | "WARNING" | "ERROR";

export interface Module_Check_Info {
    status: Check_status;
    message: string;
}
const STATUS_CONFIG: Record<Check_status, {icon: typeof CheckCircle2; buttonStyle: string; label: string; ariaLabel: string;}> = {
    UP_TO_DATE: {
        icon: CheckCircle2,
        buttonStyle: "border-mint-leaf/40 bg-mint-leaf/10 text-mint-leaf",
        label: "Aktuell:",
        ariaLabel: "Status: Aktuell",
    },
    WARNING: {
        icon: AlertTriangle,
        buttonStyle: "border-amber-400/40 bg-amber-500/10 text-amber-500",
        label: "Änderung:",
        ariaLabel: "Status: Warnung",
    },
    ERROR: {
        icon: XCircle,
        buttonStyle: "border-flag-red/40 bg-flag-red/10 text-flag-red",
        label: "Fehler:",
        ariaLabel: "Status: Fehler",
    },
};
export default function ModulStatusBadge({ info }: { info?: Module_Check_Info }) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!info) return null;

    const config = STATUS_CONFIG[info.status] ?? STATUS_CONFIG.UP_TO_DATE;
    const Icon = config.icon;

    return (
        <div className="relative inline-flex items-center">
        <button
            type="button"
            aria-label={`${config.ariaLabel}: ${info.message}`}
            aria-expanded={showTooltip}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onClick={(e) => {
            e.stopPropagation();
            setShowTooltip((prev) => !prev);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonStyle}`}
        >
            <Icon className="h-4 w-4" />
        </button>

        {/* The User needs to be able to understand the symbols, so a description shows on hover/click  */}
        {showTooltip && (
            <div
            role="tooltip"
            className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-xs -translate-x-1/2 rounded-xl border border-border bg-foreground px-3 py-2 text-xs font-medium text-background shadow-lg dark:bg-card dark:text-white"
            >
            <div className="flex items-center gap-1.5">
                <span className="font-bold">{config.label}</span>
                <span className="break-words">{info.message}</span>
            </div>

                {/* Mouse displays as arrow when hovering over tooltip */}
            <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-foreground dark:border-t-card" />
            </div>
        )}
        </div>
    );
    }