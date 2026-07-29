"use client";

import {
    ReactNode,
    useEffect,
    useState,
} from "react";

import DashboardSettings, {
    DashboardSettingsState,
    defaultDashboardSettings,
} from "@/components/dashboard-settings";

import { TrendingUp } from "lucide-react";

type DashboardContentProps = {
    gesamtfortschrittCard: ReactNode;
    ectsCard: ReactNode;
    aktuellesSemesterCard: ReactNode;
    gesamtschnittCard: ReactNode;

    aktuellesSemesterModule: ReactNode;
    naechstesSemesterModule: ReactNode;

    moduleAbgeschlossenMilestone: ReactNode;
    semesterFortschrittMilestone: ReactNode;
    wunschSchnittMilestone: ReactNode;
};

const STORAGE_KEY = "dashboard-settings";

export default function DashboardContent({
    gesamtfortschrittCard,
    ectsCard,
    aktuellesSemesterCard,
    gesamtschnittCard,
    aktuellesSemesterModule,
    naechstesSemesterModule,
    moduleAbgeschlossenMilestone,
    semesterFortschrittMilestone,
    wunschSchnittMilestone,
}: DashboardContentProps) {
    const [settings, setSettings] =
        useState<DashboardSettingsState>(defaultDashboardSettings);

    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(STORAGE_KEY);

            if (!savedSettings) {
                return;
            }

            const parsedSettings =
                JSON.parse(savedSettings) as Partial<DashboardSettingsState>;

            setSettings({
                ...defaultDashboardSettings,
                ...parsedSettings,
            });
        } catch (error) {
            console.error(
                "Dashboard-Einstellungen konnten nicht geladen werden:",
                error
            );
        }
    }, []);

    function handleSettingsChange(
        newSettings: DashboardSettingsState
    ) {
        setSettings(newSettings);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(newSettings)
            );
        } catch (error) {
            console.error(
                "Dashboard-Einstellungen konnten nicht gespeichert werden:",
                error
            );
        }
    }

    const showAnyOverviewCard =
        settings.gesamtfortschritt ||
        settings.ects ||
        settings.aktuellesSemester ||
        settings.gesamtschnitt;

    const showAnyMilestone =
        settings.moduleAbgeschlossen ||
        settings.semesterFortschritt ||
        settings.wunschSchnitt;

    return (
        <>
            {showAnyOverviewCard && (
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {settings.gesamtfortschritt &&
                        gesamtfortschrittCard}

                    {settings.ects && ectsCard}

                    {settings.aktuellesSemester &&
                        aktuellesSemesterCard}

                    {settings.gesamtschnitt &&
                        gesamtschnittCard}
                </section>
            )}

            {settings.aktuellesSemesterModule &&
                aktuellesSemesterModule}

            {settings.naechstesSemester &&
                naechstesSemesterModule}

            {showAnyMilestone && (
                <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                    <div className="mb-5 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-flag-red" />
                        <h2 className="text-xl font-bold">Meilensteine</h2>
                    </div>

                    <div className="space-y-3">
                    {settings.moduleAbgeschlossen &&
                        moduleAbgeschlossenMilestone}

                    {settings.semesterFortschritt &&
                        semesterFortschrittMilestone}

                    {settings.wunschSchnitt &&
                        wunschSchnittMilestone}
                    </div>
                </section>
            )}

            <DashboardSettings
                open={settingsOpen}
                settings={settings}
                onOpenChange={setSettingsOpen}
                onSettingsChange={handleSettingsChange}
            />
        </>
    );
}