import DeleteAccount from "@/components/delete-acc-button";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p>Profile and user-settings</p>
      <DeleteAccount/>
      <UpdatePasswordForm/>
    </div>
  );
}