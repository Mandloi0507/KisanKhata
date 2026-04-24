import { ReactNode } from "react";

/**
 * PhoneShell — centers the mobile UI inside a soft device frame
 * on tablet/desktop, while letting it fill the screen on real mobile.
 */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-soft via-background to-accent/40 flex items-center justify-center p-0 sm:p-6">
      <div
        className="
          relative w-full max-w-[420px] bg-background overflow-hidden
          min-h-screen sm:min-h-0 sm:h-[860px]
          sm:rounded-[44px] sm:border-[10px] sm:border-ink/90 sm:shadow-float
        "
      >
        {/* notch */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-ink/90 rounded-b-3xl z-50" />
        <div className="relative h-full w-full overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
