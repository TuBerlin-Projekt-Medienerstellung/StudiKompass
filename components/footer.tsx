"use client";

import React, { useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Heart, Github } from 'lucide-react';

const Footer = () => {
    const [isAgbOpen, setIsAgbOpen] = useState(false);
    const [isDatenschutzOpen, setIsDatenschutzOpen] = useState(false);
    const [isImpressumOpen, setIsImpressumOpen] = useState(false);

    const team = [
        { name: "Lena Bohlje", rollen: ["Projektmanagerin", "Frontend", "Design", "Video und Konzept"] },
        { name: "Emma Weiland", rollen: ["Frontend", "Design", "Video und Konzept"] },
        { name: "Jacob Matteo Rene Eckstein", rollen: ["Frontend", "Design", "Video und Konzept"] },
        { name: "Lennart Nicolas Lunt", rollen: ["Lead Frontend", "Design"] },
        { name: "Jasmin Heiße", rollen: ["Frontend", "Design"] },
        { name: "Volodymyr Honcharov", rollen: ["Frontend", "Design"] },
        { name: "Anna Glavatska", rollen: ["Lead Backend", "Frontend", "Architektur"] },
        { name: "Alessio Beulcke", rollen: ["Backend"] },
    ];
    const supervisorin = "Judith M.B. - Supervisorin";

    return (
        <section
            className="bg-zinc-800 dark:bg-zinc-950 flex flex-col gap-10 w-full py-10 px-4 md:px-30 min-h-fit text-white relative">
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-between">
                <div className="flex flex-col w-full md:w-96 gap-4">
                    <div className="flex flex-row items-center gap-4">
                        <div className="relative size-14">
                            <Image src="/logo/Compass-light.svg" alt="logo" fill/>
                        </div>
                        <div className="relative w-32 h-8 shrink-0">
                            <Image src="/logo/Navis-light.svg" alt="Navis" fill/>
                        </div>
                    </div>
                    <p className="opacity-80">
                        Das intelligente Navigations- und Visualisierungssystem für
                        deine Studienplanung. Entwickelt von
                        Studenten, für Studenten.</p>
                </div>

                <div className="flex flex-col items-start gap-1">
                    <span className="font-bold mb-1">Rechtliches</span>

                    {/* Impressum Button */}
                    <button
                        type="button"
                        onClick={() => setIsImpressumOpen(true)}
                        className="opacity-70 hover:opacity-100 transition-opacity text-left cursor-pointer">
                        About us
                    </button>

                    {/* Datenschutz Button */}
                    <button
                        type="button"
                        onClick={() => setIsDatenschutzOpen(true)}
                        className="opacity-70 hover:opacity-100 transition-opacity text-left cursor-pointer">
                        Datenschutz
                    </button>

                    {/* AGB Button */}
                    <button
                        type="button"
                        onClick={() => setIsAgbOpen(true)}
                        className="opacity-70 hover:opacity-100 transition-opacity text-left cursor-pointer">
                        AGB
                    </button>
                </div>
            </div>

            {/*Line*/}
            <div className="h-0.5 w-full bg-background dark:bg-white my-4 opacity-70 dark:opacity-20"/>

            <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center">
                <div className="flex flex-row gap-3 items-center">
                    <p>Made with</p>
                    <Heart className="text-flag-red shrink-0"/>
                    <p> by students at TU Berlin</p>
                </div>
                <Link href="https://github.com/orgs/TuBerlin-Projekt-Medienerstellung/dashboard">
                    <Github/>
                </Link>
            </div>

            {/* IMPRESSUM POPUP */}
            {isImpressumOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900 dark:text-zinc-100"
                    onClick={() => setIsImpressumOpen(false)}>

                    <div
                        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold">About us</h3>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed opacity-90">

                            <h4 className="font-bold text-base">Projektkontext</h4>
                            <p>
                                <strong>Navis</strong> ist ein unkommerzielles studentisches Projekt, das im Rahmen des Moduls
                                "Projekt Medienerstellung" im Sommersemester 2026 an der Technischen Universität Berlin entwickelt wurde.
                                Das Ziel war, ein Werkzeug für Studierende an der TUB zu entwickeln, das die Planung und
                                Navigation durch den Studiengangsverlauf erleichtert.
                            </p>

                            <h2 className="text-2xl font-bold text-flag-red mb-4">
                                NAVIS — Das Team
                            </h2>

                            <h3 className="font-semibold mb-2">Entwicklungsteam</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {team.map((person) => (
                                    <div key={person.name}>
                                        <p className="font-semibold text-sm">{person.name}</p>
                                        <ul className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {person.rollen.map((rolle) => (
                                                <li key={rolle}>{rolle}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <h3 className="font-semibold mb-2">Betreuung</h3>

                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">
                                {supervisorin}
                            </p>



                            <h4 className="font-bold text-base">Kontakt</h4>

                            E-Mail: <br/>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>
                                    <a href="mailto:lena.bohlje@gmail.com" className="hover:underline">
                                        Projektmanagement: lena.bohlje@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:honcharovvolodymyr2002@gmail.com" className="hover:underline">
                                        Frontendentwickler: honcharovvolodymyr2002@gmail.com
                                    </a>
                                </li>
                            </ul>
                            <p>
                                Projekt-Repository: <a href="https://github.com/orgs/TuBerlin-Projekt-Medienerstellung/dashboard" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a><br/>
                                <em>Fakultät IV / Institut an der TU Berlin</em><br/>
                            </p>


                            <h4 className="font-bold text-base">Haftungsausschluss</h4>
                            <p>
                                Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
                                Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                            </p>
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setIsImpressumOpen(false)}
                                className="px-5 py-2 bg-flag-red text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DATENSCHUTZ POPUP */}
            {isDatenschutzOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900 dark:text-zinc-100"
                    onClick={() => setIsDatenschutzOpen(false)}>

                    <div
                        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold">Datenschutzerklärung</h3>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed opacity-90">
                            <p className="italic text-xs text-zinc-500 dark:text-zinc-400">
                               Studierendenprojekt (TU Berlin).
                            </p>

                            <h4 className="font-bold text-base">1. Datenschutz auf einen Blick</h4>
                            <p>
                                Wir nehmen den Schutz deiner persönlichen Daten sehr ernst.
                                Als studentisches Projekt verarbeiten wir persönliche Daten nur im absolut notwendigen Umfang
                                zur Bereitstellung der Funktionen von <strong>Navis</strong>.
                            </p>

                            <h4 className="font-bold text-base">2. Datenerfassung auf dieser Website</h4>
                            <p>
                                <strong>Registrierung & Login:</strong> Bei der Erstellung eines Kontos verarbeiten wir deine
                                E-Mail-Adresse und dein gewähltes Passwort (verschlüsselt). Diese Daten werden zur Bereitstellung
                                deines persönlichen Studienplans benötigt.
                            </p>
                            <p>
                                <strong>Nutzungsdaten:</strong> Deine angelegten Module, ECTS-Punkte, Semester-Planungen und
                                Noten werden sicher in unserer Datenbank (Supabase) gespeichert, um sie dir bei jedem Login wieder anzuzeigen.
                            </p>

                            <h4 className="font-bold text-base">3. Hosting & Datenverarbeitung</h4>
                            <p>
                                Unsere Anwendung verwendet <strong>Supabase</strong> als Datenbank- und Authentifizierungsdienst.
                                Die Server befinden sich innerhalb der Europäischen Union und unterliegen den strengen Vorgaben der DSGVO.
                            </p>

                            <h4 className="font-bold text-base">4. Weitergabe von Daten</h4>
                            <p>
                                Deine persönlichen Daten werden unter keinen Umständen
                                an Dritte verkauft oder für Werbezwecke weitergegeben.
                            </p>

                            <h4 className="font-bold text-base">5. Deine Rechte</h4>
                            <p>
                                Du hast jederzeit das Recht, Auskunft über deine gespeicherten Daten zu erhalten,
                                deren Berichtigung zu verlangen oder dein Konto inkl. aller gespeicherten Module vollständig löschen zu lassen.
                            </p>
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setIsDatenschutzOpen(false)}
                                className="px-5 py-2 bg-flag-red text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AGB POPUP */}
            {isAgbOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-900 dark:text-zinc-100"
                    onClick={() => setIsAgbOpen(false)}>
                    <div
                        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center  p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xl font-bold">Allgemeine Nutzungsbedingungen (AGB)</h3>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed opacity-90">
                            <p className="italic text-xs text-zinc-500 dark:text-zinc-400">
                                Hinweis: Dies ist ein Projekt im Rahmen eines Moduls der TU Berlin.
                                Es besteht kein kommerzieller Zweck.
                            </p>

                            <h4 className="font-bold text-base">§ 1 Geltungsbereich und Gegenstand</h4>
                            <p>
                                Navis ist ein Visualisierungs- und Planungstool für das Studium.
                                Die Webapp ermöglicht Studierenden das Organisieren von Modulen,
                                Nachverfolgen von ECTS und Verwalten von Studienplänen.
                            </p>

                            <h4 className="font-bold text-base">§ 2 Leistungsumfang & Verfügbarkeit</h4>
                            <p>
                                Navis wird kostenlos und ohne Gewähr zur Verfügung gestellt.
                                Es besteht kein Anspruch auf permanente Verfügbarkeit, Wartung oder Fehlerfreiheit des Dienstes.
                            </p>

                            <h4 className="font-bold text-base">§ 3 Richtigkeit der Daten & Haftungsausschluss</h4>
                            <p>
                                Die in Navis angezeigten Informationen haben keinen Anspruch auf Richtigkeit und Vollständigkeit.
                                Auch wenn wir uns sehr bemühen dies zu gewährleisten.
                                Rechtsverbindlich sind einzig die offiziellen Studien- und Prüfungsordnungen sowie die offiziellen Systeme
                                der jeweiligen Hochschule (MOSES bzw. ISIS).
                                Die Betreiber haften nicht für Schäden oder Datenverluste.
                            </p>

                            <h4 className="font-bold text-base">§ 4 Urheberrecht</h4>
                            <p>
                                Die bereitgestellten Inhalte, Designs und Codes von Navis sind urheberrechtlich geschützt.
                                Eine Nutzung außerhalb von Navis bedarf der Zustimmung des Projektteams.
                            </p>
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={() => setIsAgbOpen(false)}
                                className="px-5 py-2 bg-flag-red text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
export default Footer