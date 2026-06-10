"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {Pencil, User} from 'lucide-react';

export function UpdateEmailForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdateEmail = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      setIsSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Es ist ein Fehler aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendEmail = async () => {
    if (!email) return;
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ email });
        // type: 'email_change',
        // email: email,
    if (error) throw error;
      alert("Bestätigungsmail wurde erneut gesendet!");}
    catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Konnte nicht gesendet werden.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <Card>
        <CardHeader className="flex flex-row gap-4 pb-4 md:justify-start items-center">
          <Pencil className="text-flag-red w-7 h-7 stroke-2"></Pencil>
          <CardTitle className="text-xl font-bold">E-Mail zurücksetzen</CardTitle>
        </CardHeader>  
        <CardContent>
        <CardDescription className="text-zinc-500 pb-5">
          Bitte gib die neue E-Mail Adresse ein.
        </CardDescription>
        {isSuccess ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-mint-leaf">
              Prüfe dein Postfach, um die Änderung zu bestätigen.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResendEmail} 
              disabled={isLoading}
            >
              {isLoading ? "Senden..." : "Bestätigungsmail erneut senden"}
            </Button>
            {error && <p className="text-sm text-flag-red">{error}</p>}
          </div>
        ) :(
          <form onSubmit={handleUpdateEmail}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Neue E-Mail:</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-Mail eingeben..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-flag-red">{error}</p>}
              <Button type="submit" className="w-full bg-flag-red" disabled={isLoading}>
                {isLoading ? "Speichern..." : "Speichere neue E-Mail"}
              </Button>
              
            </div>
          </form>
        )}
        </CardContent>
      </Card>
    </div>
  );}


