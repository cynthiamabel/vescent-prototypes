"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SuspendedAccount() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Account suspended</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Your account is suspended. Please contact{" "}
            <a className="font-medium text-primary" href="mailto:hello@vescent.co">
              hello@vescent.co
            </a>{" "}
            if you think this is an error.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
