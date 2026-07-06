import SettingsClient from "@/components/settings-client";
import Studiengang from "@/components/studiengangwahl";
import { UpdatePasswordForm } from "@/components/update-password-form";
import DeleteAccount from "@/components/delete-acc-button";
import { UpdateEmailForm } from "@/components/update-email-form";
import { UpdateSemesterForm } from "@/components/update-semester-form";
import Link from "next/link";
export default function SettingsPage() {
    return (
        <div className="flex min-h-full flex-col px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold sm:text-3xl">Einstellungen</h1>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        Verwalte dein Profil und Präferenzen
                    </p>
                </div>
                <SettingsClient />
                <Studiengang />
                <UpdateSemesterForm />
                <UpdateEmailForm />
                <UpdatePasswordForm />
                <DeleteAccount />
            </div>
            <div className="mt-auto flex justify-end pt-12">
                <Link
                    href="/protected/settings/admin"
                    className="cursor-default text-xs font-mono text-gray-300 transition-colors hover:cursor-pointer hover:text-gray-500 dark:text-gray-700 dark:hover:text-gray-500"
                >
                    Admin Access
                </Link>
            </div>
        </div>
    );
}