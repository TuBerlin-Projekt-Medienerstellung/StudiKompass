import {SignUpProcess} from "@/components/sign_up-consent";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpProcess/>
      </div>
    </div>
  );
}
