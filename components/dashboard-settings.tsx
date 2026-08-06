"use client";

// import { useState } from "react";
// import { createClient } from "@/lib/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import TotalEctsInput from "@/components/total-ects-input";
import TargetGradeInput from "@/components/target-grade";

export type DashboardSettingsState = {
    gesamtfortschritt: boolean;
    ects: boolean;
    aktuellesSemester: boolean;
    gesamtschnitt: boolean;
    aktuellesSemesterModule: boolean;
    naechstesSemester: boolean;
    moduleAbgeschlossen: boolean;
    semesterFortschritt: boolean;
    wunschSchnitt: boolean;
};

type SettingsItem = {
    key: keyof DashboardSettingsState;
    label: string;
};

export const defaultDashboardSettings: DashboardSettingsState = {
    gesamtfortschritt: true,
    ects: true,
    aktuellesSemester: true,
    gesamtschnitt: true,
    aktuellesSemesterModule: true,
    naechstesSemester: false,
    moduleAbgeschlossen: true,
    semesterFortschritt: true,
    wunschSchnitt: false,
};

type DashboardSettingsProps = {
    open: boolean;
    settings: DashboardSettingsState;
    initialTotalEcts: number;
    initialTargetGrade: number | null;
    onOpenChange: (open: boolean) => void;
    onSettingsChange: (settings: DashboardSettingsState) => void;
};

export default function DashboardSettings({
    open,
    settings,
    initialTotalEcts,
    initialTargetGrade,
    onOpenChange,
    onSettingsChange,
}: DashboardSettingsProps) {
    function toggle(key: keyof DashboardSettingsState) {
        onSettingsChange({
            ...settings,
            [key]: !settings[key],
        });
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-border">
            <button
                type="button"
                onClick={() => onOpenChange(!open)}
                className="flex w-full items-center justify-between bg-[#ECE8E8] px-5 py-4 transition-colors hover:bg-[#E2DEDE] dark:bg-[#242424] dark:hover:bg-[#2d2d2d]"
            >
                <span className="font-semibold">
                    Dashboard-Einstellungen
                </span>

                {open ? (
                    <ChevronUp className="h-5 w-5" />
                ) : (
                    <ChevronDown className="h-5 w-5" />
                )}
            </button>

            {open && (
                <div className="space-y-4 bg-card p-5">
                    <SettingsGroup
                        title="Übersicht"
                        items={[
                            {
                                key: "gesamtfortschritt",
                                label: "Gesamtfortschritt",
                            },
                            {
                                key: "ects",
                                label: "ECTS",
                            },
                            {
                                key: "aktuellesSemester",
                                label: "Aktuelles Semester",
                            },
                            {
                                key: "gesamtschnitt",
                                label: "Gesamtschnitt",
                            },
                        ]}
                        settings={settings}
                        onToggle={toggle}
                    />

                    <SettingsGroup
                        title="Semester"
                        items={[
                            {
                                key: "aktuellesSemesterModule",
                                label: "Aktuelles Semester",
                            },
                            {
                                key: "naechstesSemester",
                                label: "Nächstes Semester",
                            },
                        ]}
                        settings={settings}
                        onToggle={toggle}
                    />

                    <SettingsGroup
                        title="Meilensteine"
                        items={[
                            {
                                key: "moduleAbgeschlossen",
                                label: "Module abgeschlossen",
                            },
                            {
                                key: "semesterFortschritt",
                                label: "Aktuelles Semester",
                            },
                            {
                                key: "wunschSchnitt",
                                label: "Wunschschnitt",
                            },
                        ]}
                        settings={settings}
                        onToggle={toggle}
                    />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:justify-items-center">
                        <TotalEctsInput initialValue={initialTotalEcts} />

                        <TargetGradeInput
                            initialValue={initialTargetGrade}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}

function SettingsGroup({
    title,
    items,
    settings,
    onToggle,
}: {
    title: string;
    items: SettingsItem[];
    settings: DashboardSettingsState;
    onToggle: (key: keyof DashboardSettingsState) => void;
}) {
    return (
        <div className="rounded-xl border border-border p-4">
            <h3 className="mb-4 text-lg font-semibold">{title}</h3>

            <div className="space-y-3">
                {items.map((item) => (
                    <label
                        key={item.key}
                        className="flex items-center justify-between gap-4"
                    >
                        <span>{item.label}</span>

                        <input
                            type="checkbox"
                            checked={settings[item.key]}
                            onChange={() => onToggle(item.key)}
                            className="h-4 w-4 accent-flag-red"
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}