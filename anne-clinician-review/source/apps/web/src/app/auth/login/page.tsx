"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@vescent/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Portal = "teen" | "mentor";
const APPLE_AUTH_STATE_KEY = "vescent.appleAuthState";

export default function LoginPage() {
  const { loginMutation } = useAuth();
  const [portal, setPortal] = useState<Portal>("teen");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const registerHref = portal === "mentor" ? "/auth/mentor-interest" : "/auth/register";
  const appleServiceId = process.env.NEXT_PUBLIC_APPLE_SERVICE_ID;
  const appleRedirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
  const isAppleConfigured = Boolean(appleServiceId && appleRedirectUri);

  const startAppleLogin = () => {
    if (!appleServiceId || !appleRedirectUri) return;
    const state = window.btoa(JSON.stringify({ portal, csrf: crypto.randomUUID() }));
    window.sessionStorage.setItem(APPLE_AUTH_STATE_KEY, state);
    const appleUrl = `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
      client_id: appleServiceId,
      redirect_uri: appleRedirectUri,
      response_type: "code id_token",
      response_mode: "fragment",
      state,
    }).toString()}`;
    window.location.href = appleUrl;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 rounded-md border bg-muted/30 p-1">
            {(["teen", "mentor"] as const).map((item) => (
              <Button
                key={item}
                type="button"
                variant={portal === item ? "default" : "ghost"}
                size="sm"
                onClick={() => setPortal(item)}
                className={cn(portal !== item && "shadow-none")}
              >
                {item === "teen" ? "Teen" : "Mentor"}
              </Button>
            ))}
          </div>
          <form
            onSubmit={handleSubmit((data) => loginMutation.mutate({ ...data, portal }))}
            className="space-y-4"
          >
            <div>
              <Input type="text" placeholder="Username or email" {...register("username")} />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : `Sign in as ${portal === "teen" ? "teen" : "mentor"}`}
            </Button>
          </form>
          {isAppleConfigured ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={startAppleLogin}
            >
              Continue with Apple
            </Button>
          ) : null}
          <div className="mt-4 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link href={registerHref} className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
