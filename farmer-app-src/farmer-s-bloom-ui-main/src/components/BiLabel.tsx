import { cn } from "@/lib/utils";

/**
 * BiLabel — English primary, Devanagari secondary on the next line.
 * Use `inline` to render them side-by-side instead.
 */
export function BiLabel({
  en,
  hi,
  className,
  hiClassName,
  inline = false,
}: {
  en: string;
  hi: string;
  className?: string;
  hiClassName?: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <span className={cn("inline-flex items-baseline gap-1.5", className)}>
        <span>{en}</span>
        <span lang="hi" className={cn("font-hi text-xs opacity-70", hiClassName)}>
          {hi}
        </span>
      </span>
    );
  }
  return (
    <span className={cn("flex flex-col leading-tight", className)}>
      <span>{en}</span>
      <span lang="hi" className={cn("font-hi text-[0.7em] opacity-70 mt-0.5", hiClassName)}>
        {hi}
      </span>
    </span>
  );
}
