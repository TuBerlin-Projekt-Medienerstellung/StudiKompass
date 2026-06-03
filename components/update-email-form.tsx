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
import { useState } from "react";

export function UpdateEmailForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-card border border-zinc-600 dark:border-border p-6 rounded-xl", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-black dark:text-white mb-2">Reset Your E-Mail</CardTitle>
          <CardDescription className="text-zinc-500">
            Please enter your new email below.
          </CardDescription>
        </CardHeader>  
        <CardContent>
        {isSuccess ? (
            <p className="text-sm text-green-500">
            Check your new email to confirm the change.</p>
        ) :(
          <form onSubmit={handleUpdateEmail}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="New email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save new email"}
              </Button>
            </div>
          </form>
        )}
        </CardContent>
      </Card>
    </div>
  );}


