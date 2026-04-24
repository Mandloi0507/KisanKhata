import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Globe2,
  Shield,
  HelpCircle,
  LogOut,
  Phone,
  MapPin,
  Wheat,
  Bell,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { farmer } from "@/lib/mock-data";
import farmerAvatar from "@/assets/farmer-avatar.jpg";
import farmAerial from "@/assets/farm-aerial.jpg";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — KisanKhata" }],
  }),
  component: () => (
    <PhoneShell>
      <Profile />
    </PhoneShell>
  ),
});

function Profile() {
  return (
    <div className="min-h-full flex flex-col bg-surface-soft">
      <ScreenHeader title="Profile" titleHi="प्रोफ़ाइल" />

      <div className="px-5 pb-6 space-y-5 flex-1">
        {/* Identity card */}
        <div className="relative rounded-3xl overflow-hidden shadow-card">
          <img
            src={farmAerial}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
          <div className="relative p-5 text-white">
            <img
              src={farmerAvatar}
              alt={farmer.name}
              className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/30"
            />
            <div className="mt-3">
              <div className="text-xl font-bold">{farmer.name}</div>
              <div lang="hi" className="font-hi text-sm text-white/85">
                {farmer.nameHi}
              </div>
              <div className="font-mono text-[11px] text-white/75 mt-1">
                {farmer.id}
              </div>
            </div>
          </div>
        </div>

        {/* Farm info */}
        <div className="rounded-2xl bg-white border border-border divide-y divide-border">
          <Row icon={Phone} label="Phone" hi="मोबाइल" value={farmer.phone} />
          <Row icon={Shield} label="Aadhaar" hi="आधार" value={farmer.aadhaarMasked} />
          <Row icon={MapPin} label="District" hi="ज़िला" value={farmer.district} />
          <Row
            icon={Wheat}
            label="Crops"
            hi="फसल"
            value={`${farmer.primaryCrop} · ${farmer.secondaryCrop}`}
          />
          <Row
            icon={Wheat}
            label="Land"
            hi="ज़मीन"
            value={`${farmer.landAcres} acres`}
          />
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-white border border-border divide-y divide-border">
          <Action icon={Globe2} label="Language" hi="भाषा" trailing="EN · हिं" />
          <Link to="/notifications">
            <Action icon={Bell} label="Notifications" hi="सूचनाएँ" trailing="4 new" />
          </Link>
          <Action icon={Shield} label="Privacy & data" hi="गोपनीयता" />
          <Action icon={HelpCircle} label="Help & support" hi="सहायता" />
          <Action icon={LogOut} label="Sign out" hi="लॉग आउट" danger />
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          KisanKhata v1.0 · Made with care by Team Utkarsh
        </p>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  hi,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hi: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="h-9 w-9 rounded-xl grid place-items-center bg-primary-soft text-primary-deep">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div lang="hi" className="font-hi text-[10px] text-muted-foreground/80">
          {hi}
        </div>
      </div>
      <div className="font-semibold text-sm text-right">{value}</div>
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  hi,
  trailing,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hi: string;
  trailing?: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${
        danger ? "text-danger" : "text-foreground"
      }`}
    >
      <span
        className={`h-9 w-9 rounded-xl grid place-items-center ${
          danger ? "bg-danger/10 text-danger" : "bg-muted text-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div lang="hi" className="font-hi text-[10px] text-muted-foreground">
          {hi}
        </div>
      </div>
      {trailing && (
        <span className="text-xs text-muted-foreground mr-1">{trailing}</span>
      )}
      {!danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
