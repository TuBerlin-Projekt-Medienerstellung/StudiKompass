"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";



export default function Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleResendEmail_SignUP = async () => {
    if (!email) return;
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
    })
    if (error) throw error;
      alert("Confirmation email resent!");}
    catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while resending");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up! <br />
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent className = "flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <Button className="self-center"
                onClick= {handleResendEmail_SignUP}
                disabled ={isLoading || !email}>
                {isLoading ? "Sending..." : "Resend Email"}
              </Button>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
