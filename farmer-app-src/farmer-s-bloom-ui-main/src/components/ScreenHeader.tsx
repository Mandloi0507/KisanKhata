import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  titleHi?: string;
  back?: string;
  right?: ReactNode;
  variant?: "light" | "dark";
}

export function ScreenHeader({ title, titleHi, back, right, variant = "light" }: Props) {
  const dark = variant === "dark";
  return (
    <header
      className={cn(
        "flex items-center justify-between px-5 pt-6 pb-4",
        dark ? "text-primary-foreground" : "text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        {back && (
          <Link
            to={back}
            aria-label="Back"
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full",
              dark
                ? "bg-white/15 hover:bg-white/25 text-white"
                : "bg-muted hover:bg-accent"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {titleHi && (
            <p
              lang="hi"
              className={cn(
                "font-hi text-xs",
                dark ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {titleHi}
            </p>
          )}
        </div>
      </div>
      {right}
    </header>
  );
}
