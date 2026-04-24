import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Construction } from "lucide-react";

export default function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <DashboardHeader title={title} subtitle={subtitle} />
      <main className="flex flex-1 items-center justify-center p-10">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-500">
            <Construction className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">Coming soon</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">This module will be wired to real APIs in the next sprint.</p>
        </div>
      </main>
    </>
  );
}
