import { ChevronUp, Circle, CircleCheckBig } from 'lucide-react';
import { details } from "@/constants";
import Link from "next/link";

const ModulCard = () => {
    return (
        <div className='w-full flex border-y-2 border-x-4 rounded-xl p-6 flex-col gap-5'>
            <header className='w-full flex justify-between items-center'>
                <div className='flex w-fit gap-2.5 '>
                    <button>
                        <Circle />
                    </button>
                    <div className='flex gap-6 items-center'>
                        {/** Hier fetchen für den Titel **/}
                        <h1 className='font-bold text-2xl'>Software Eintwicklung</h1>
                        <div className='flex gap-2'>
                            {/** Hier fetchen für Infos **/}
                            <div>6 ECTS</div>
                            <span className=''>• Sose •</span>
                            {/** Color angepasst auf Pflicht/Wahlpflicht/wahlt **/}
                            <p className='text-blue-bell'>Wahlpflichtmodul</p>
                        </div>
                    </div>

                </div>
                <ChevronUp />
            </header>
            <div>
                <h2 className='font-semibold text-lg'>Beschreibung</h2>
                {/** Hier fetchen für die Beschreibung **/}
                <p className='opacity-80'>
                    Im Projekt bearbeiten die Studierenden selbstständig in Gruppenarbeit konkrete Probleme. Ein grundsätzliches Projektthema wird vorgegeben, die Ausgestaltung kann in der Gruppe und unter Absprache mit der gruppenleitenden Person selbständig definiert werden. Fortschritte werden in regelmäßigen Absprachen Betreuern besprochen, die Ergebnisse werden in einer Zwischen- sowie in einer Abschlusspräsentation vor allen Teilnehmenden des Kurses vorgestellt sowie den Betreuern einem Projektbericht niedergelegt.
                </p>
            </div>
            <div>
                {/** Hier fetchen für die Details, gerade werden dummy daten von constants gefetchtet **/}
                {details.map((detail) => (
                    <div>
                        <span>
                            {detail.name}
                        </span>
                        <p>
                            {detail.value}
                        </p>
                    </div>
                ))}


            </div>
            <div>
                buttons und moses link
                <Link href="#">
                </Link>
            </div>

        </div>
    )
}

export default ModulCard;