import SettingsClient from "@/components/settings-client"
import Studiengang from "@/components/studiengangwahl"
import { UpdatePasswordForm } from "@/components/update-password-form"
import DeleteAccount from "@/components/delete-acc-button"
import { UpdateEmailForm } from "@/components/update-email-form"

export default function SettingsPage() {
    return (
        <div className="p-6 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Einstellungen</h1>
            <p className="text-muted-foreground">Verwalte dein Profil und Präferenzen</p>
            <SettingsClient />
            <Studiengang />
            <UpdateEmailForm />
            <UpdatePasswordForm />
            <DeleteAccount />
        </div>
    )
}
