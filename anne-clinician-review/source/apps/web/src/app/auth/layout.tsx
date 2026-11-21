"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const wide = pathname === "/auth/register";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-md")}>
        <div className="text-center mb-8">
          <h1 className="text-5xl text-foreground">Vescent</h1>
          <p className="text-muted-foreground mt-2">Connect. Share. Grow.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
