import { AlertCircle } from "lucide-react";

interface Privacy_termsProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function Privacy_terms({ isOpen, onAccept, onDecline }: Privacy_termsProps) {
    if (!isOpen) return null;

    return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
                    <div className="flex items-center gap-2 mb-4 shrink-0">
                        <AlertCircle className="size-5 text-red-600 shrink-0" />
                        <h2 className="text-xl font-bold">Nutzungsbedingungen & Datenschutz</h2>
                    </div>
                    
                    <div className="overflow-y-auto pr-2 flex-1 text-sm text-muted-foreground space-y-4 mb-6">
                        <p className="text-xs italic">
                            Bitte lies dir die folgenden Nutzungsbedingungen und Datenschutzhinweise aufmerksam durch, bevor du fortfährst.
                        </p>

                        <div className="border-b border-border pb-2 pt-2">
                            <h3 className="text-base font-bold text-foreground">Nutzungsbedingungen (Terms of Service)</h3>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">§ 1 Gegenstand der Anwendung und Rahmenbedingungen</h4>
                            <p className="mt-1">1. NAVIS (Navigations- und Visualisierungssystem für Studienplanung) ist ein unkommerzielles studentisches Projekt, das im Rahmen eines Moduls an der Technischen Universität Berlin entwickelt wurde.</p>
                            <p className="mt-1">2. Die Webanwendung stellt Werkzeuge zur visuellen Zusammenstellung von Studienverläufen, zur Berechnung des Studienfortschritts (ECTS, Notendurchschnitt) und zur Bereitstellung eines studentischen Feedbackforums zur Verfügung.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">§ 2 Verhaltensregeln, Personenschutz und Modulbewertungen</h4>
                            <p className="mt-1"><strong>1. Konstruktive Kritik und Personenschutz:</strong> Das Verfassen von Modulbewertungen und Freitextkommentaren dient ausschließlich dem sachlichen Erfahrungsaustausch über Lehrveranstaltungen. Alle Beiträge müssen konstruktiv, sachlich und respektvoll formuliert sein. Die Herabwürdigung, Beleidigung oder Diffamierung von Lehrenden, Studierenden oder sonstigen Personen ist strengstens untersagt.</p>
                            <p className="mt-1"><strong>2. Dreistufiges Verwarnungssystem bei Verstößen:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                                <li><strong>1. und 2. Verwarnung:</strong> Bei unsachgemäßen, beleidigenden oder ehrverletzenden Beiträgen erhält der Nutzer eine formelle Verwarnung, und der betroffene Kommentar wird unverzüglich gelöscht.</li>
                                <li><strong>3. Verwarnung (Kontolöschung):</strong> Bei der dritten Verwarnung wird das Benutzerkonto des Nutzers dauerhaft gesperrt und inklusive aller hinterlegten Datensätze unwiderruflich aus dem System gelöscht.</li>
                            </ul>
                            <p className="mt-1">3. Der Anbieter behält sich vor, bei schwerwiegenden Rechtsverstößen Kommentare ohne Vorwarnung direkt zu entfernen.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">§ 3 Leistungsumfang und Haftungsausschluss</h4>
                            <p className="mt-1">1. NAVIS wird kostenlos und ohne Anspruch auf ständige Verfügbarkeit, Fehlerfreiheit oder Wartung bereitgestellt.</p>
                            <p className="mt-1">2. Modulinformationen werden über die automatisierte Schnittstelle (MOSES-API der TU Berlin) geladen. Für die Aktualität, Richtigkeit und Vollständigkeit dieser Daten wird keine Gewähr übernommen.</p>
                            <p className="mt-1">3. Sämtliche in der Anwendung berechneten Kennzahlen (Notenschnitte, ECTS-Summen, Fachsemester) dienen rein der persönlichen Orientierung und besitzen keine rechtliche Bindung für Prüfungs- oder Verwaltungsakte.</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">§ 4 Beendigung der Nutzung</h4>
                            <p className="mt-1">Nutzer können ihr Benutzerkonto sowie alle verknüpften Eingaben jederzeit eigenständig und ohne Angabe von Gründen über die Profileinstellungen löschen.</p>
                        </div>

                        <div className="border-b border-border pb-2 pt-4">
                            <h3 className="text-base font-bold text-foreground">Datenschutzhinweise (Privacy Notice)</h3>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">1. Projektkontext und Ansprechpartner</h4>
                            <p className="mt-1">
                                Diese WebApp wird als unkommerzielles studentisches Projekt betrieben. Die Verantwortung für die Bereitstellung liegt beim <strong>NAVIS Projektteam</strong>. Genauere Informationen zu dem Entwicklungsteam finden Sie in der <strong>About Us</strong> section (Footer).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">2. Vertraulichkeit und Sichtbarkeit persönlicher Daten</h4>
                            <ul className="list-disc list-inside space-y-2 mt-1">
                                <li>
                                    <strong>Exklusiver Zugriff auf Studienpläne und Noten:</strong> Sämtliche im Planer erfassten Daten (Module, Noten, ECTS-Punkte, Semesterzuordnungen, Fehlversuche) sowie Zugangsdaten (E-Mail-Adresse, verschlüsseltes Passwort) sind <strong>ausschließlich für dich selbst sowie für autorisierte System-Administrator*innen einsehbar</strong>. Andere Nutzer der Anwendung haben keinerlei Einblick in deine Studienplanung oder Leistungsergebnisse.
                                </li>
                                <li>
                                    <strong>Sichtbarkeit bei Modulbewertungen:</strong> Von dir verfasste Sternen-Bewertungen und Freitextkommentare zu Modulen werden im öffentlichen Bewertungsbereich für andere angemeldete Nutzer sichtbar dargestellt. Um deine Anonymität zu wahren, werden diese Beiträge ausschließlich zusammen mit deinem frei gewählten Benutzernamen und deinem Profil-Avatar angezeigt, ohne Offenlegung deines Klarnamens oder deiner E-Mail-Adresse.
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">3. Infrastruktur, Serverstandort Frankfurt und Europäische Datenschutz-Regelungen</h4>
                            <p className="mt-1">Für den technischen Betrieb der Anwendung werden spezialisierte Dienstleister genutzt, die Daten ausschließlich nach strengen Vorgaben verarbeiten:</p>
                            
                            <div className="mt-2 space-y-3 pl-2 border-l-2 border-border">
                                <div>
                                    <p className="font-semibold text-foreground">Supabase Inc. (Datenbank, Authentifizierung & Storage):</p>
                                    <p className="mt-1"> Supabase stellt die PostgreSQL-Datenbank bereit und verwaltet Nutzerkonten, persönliche Studienpläne, Noten, Modulbewertungen sowie hochgeladene Profilbilder (Avatare).</p>
                                    <p className="mt-1"> Sämtliche Daten und Datenbanken werden ausschließlich im Rechenzentrum <strong>Frankfurt am Main, Deutschland (Central EU)</strong> betrieben.</p>
                                    <p className="mt-1">Geltende Europäische Regelungen:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4 text-xs mt-1">
                                        <li><strong>Vollständige Anwendbarkeit der DSGVO (GDPR):</strong> Durch den Serverstandort in Frankfurt am Main unterliegt die gesamte Datenverarbeitung vollumfänglich den strengen Vorgaben der europäischen Datenschutz-Grundverordnung (DSGVO) sowie des Bundesdatenschutzgesetzes (BDSG).</li>
                                        <li><strong>Verbot von Drittlandstransfers (Art. 44 ff. DSGVO):</strong> Das bedeutet, es werden keine personenbezogenen Daten in unsichere Drittstaaten übermittelt. Dies garantiert, dass die Daten nicht ohne rechtliche Grundlage europäischen Schutzniveaus entzogen werden.</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold text-foreground">Vercel Inc. (Application Hosting & Webserver):</p>
                                    <p className="mt-1">Vercel stellt die Anwendungsoberfläche und den Anwendungscode bereit. Bei jedem Seitenaufruf werden die angeforderten Inhalte im flüchtigen Arbeitsspeicher verarbeitet, um die WebApp im Browser darzustellen.</p>
                                    <p className="mt-1">Tracking- und Analysedienste sind nachweislich deaktiviert. Es erfolgt keine Speicherung von IP-Adressen oder Nutzungsprofilen.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">4. Rechtsgrundlagen der Verarbeitung</h4>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                                <li><strong>Dienstbereitstellung (Art. 6 Abs. 1 lit. b DSGVO):</strong> Für die Bereitstellung des Nutzerkontos, das Speichern deines Studienverlaufs und die Authentifizierung.</li>
                                <li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Für das freiwillige Hochladen eines Profilbildes sowie das Absenden von Kommentaren im Modulforum.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-foreground">5. Löschkonzept</h4>
                            <p className="mt-1">Jeder Nutzer kann sein Konto jederzeit selbstständig auflösen. Sobald du in den Profileinstellungen die Funktion „Konto löschen“ ausführst, werden dein Nutzerprofil sowie alle damit verbundenen Datensätze (Studienpläne, Noten, Modulzuordnungen, eigene Bewertungen und hochgeladene Avatare) automatisch, sofort und unwiderruflich aus der Datenbank und den Speichermedien entfernt.</p>
                        </div>
                    </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
                    <button 
                        onClick={onDecline}
                        className="px-4 py-2 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Ablehnen
                    </button>
                    <button 
                        onClick={onAccept}
                        className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:opacity-90 transition-opacity"
                    >
                        Akzeptieren
                    </button>
                </div>
            </div>
        </div>
    );
}