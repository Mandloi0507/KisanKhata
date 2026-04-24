import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }: { className?: string; variant?: "default" | "light" }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-green">
        <Sprout className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className={cn("text-lg font-bold tracking-tight", variant === "light" ? "text-white" : "text-primary-700")}>
        KisanKhata<span className="text-primary-500">.</span>
      </span>
    </div>
  );
}
