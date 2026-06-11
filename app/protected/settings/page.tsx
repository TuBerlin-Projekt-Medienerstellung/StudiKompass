import SettingsClient from "@/components/settings-client"
import Studiengang from "@/components/studiengangwahl"
import { UpdatePasswordForm } from "@/components/update-password-form"
import DeleteAccount from "@/components/delete-acc-button"
import { UpdateEmailForm } from "@/components/update-email-form"
import { UpdateSemesterForm } from "@/components/update-semester-form";
import Link from "next/link";


export default function SettingsPage() {
    return (
        <div>
            <div className="p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Einstellungen</h1>
                <p>Verwalte dein Profil und Präferenzen</p>
                <SettingsClient />
                <Studiengang />
                <UpdateSemesterForm />
                <UpdateEmailForm />
                <UpdatePasswordForm />
                <DeleteAccount />
            </div>
            <div className="mt-auto pt-12 flex justify-end">
                <Link href={'/protected/settings/admin'} 
                className="text-xs font-mono text-gray-300 hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500 transition-colors cursor-default hover:cursor-pointer">
                Admin Access 
                </Link> 
            </div>
        </div>
    )
}