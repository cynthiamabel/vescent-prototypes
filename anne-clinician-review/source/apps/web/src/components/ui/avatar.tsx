import * as React from "react";
import { cn } from "@/lib/utils";
import { FullscreenImageViewer } from "@/components/ui/fullscreen-image-viewer";

interface AvatarProps {
  src?: string | null | undefined;
  username?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  colorCode?: string | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  expandable?: boolean;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function Avatar({
  src,
  username,
  firstName,
  lastName,
  colorCode,
  size = "md",
  className,
  onClick,
  expandable = false,
}: AvatarProps) {
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() ||
    username?.[0]?.toUpperCase() ||
    "?";

  if (src) {
    return (
      <>
        <div
          onClick={(event) => {
            if (expandable) {
              event.preventDefault();
              event.stopPropagation();
              setViewerOpen(true);
            }
            onClick?.();
          }}
          onKeyDown={(event) => {
            if (expandable && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              setViewerOpen(true);
            }
          }}
          role={expandable || onClick ? "button" : undefined}
          tabIndex={expandable || onClick ? 0 : undefined}
          aria-label={expandable ? `View ${username ?? "profile"} image` : undefined}
          className={cn(
            "relative rounded-full overflow-hidden flex-shrink-0",
            (expandable || onClick) && "cursor-pointer hover:opacity-80",
            sizeMap[size],
            className,
          )}
        >
          <img
            src={src}
            alt={username ?? "avatar"}
            className="h-full w-full object-cover"
          />
        </div>
        {expandable ? (
          <FullscreenImageViewer
            src={src}
            alt={`${username ?? "Profile"} image`}
            open={viewerOpen}
            onOpenChange={setViewerOpen}
          />
        ) : null}
      </>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-avatar-foreground bg-avatar-fallback flex-shrink-0",
        onClick && "cursor-pointer hover:opacity-80",
        sizeMap[size],
        className,
      )}
      style={colorCode ? { backgroundColor: colorCode } : undefined}
    >
      {initials}
    </div>
  );
}
