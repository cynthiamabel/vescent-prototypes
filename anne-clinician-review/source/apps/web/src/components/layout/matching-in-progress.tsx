import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function MatchingInProgress({ isFree }: { isFree: boolean }) {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-3xl mb-3">
          {isFree ? "Account review in progress" : "Matching in progress"}
        </h1>
        <p className="text-muted-foreground">
          {isFree
            ? "Your account is under review. We’ll let you know when it’s ready."
            : "Matching is in progress. We’ll let you know when your mentor match is ready."}
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => void clearAuth()}>
          Log out
        </Button>
      </div>
    </div>
  );
}
