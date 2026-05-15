import DeleteAccount from "@/components/delete-acc-button";
import { UpdatePasswordForm } from "@/components/update-password-form";
import Profile from "@/components/fetch-profile"
import Studiengang from "@/components/studiengangwahl"
//import Email_Reset from "@/components/"

export default function SettingsPage() {
  return (
    <div className=" p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Einstellungen</h1>
      <p>Verwalte dein Profil und Präferenzen</p>
      <Profile/>
      <Studiengang/>
      {/*<Email_Reset/>*/}
      <UpdatePasswordForm/>
      <DeleteAccount/>
    </div>
  );
}