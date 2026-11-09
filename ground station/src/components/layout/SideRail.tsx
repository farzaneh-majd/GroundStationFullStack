import { IconBell, IconCompass, IconGear, IconGrid, IconSearch } from "@/components/ui/icons";

function RailIcon({
  children,
  label,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-[var(--gs-radius)] transition-colors ${
        active
          ? "bg-[var(--gs-blue)]/15 text-[var(--gs-blue-light)]"
          : "text-[var(--gs-faint)] hover:bg-[var(--gs-surface-hover)] hover:text-[var(--gs-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function SideRail() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[var(--gs-rail-width)] shrink-0 flex-col items-center gap-2 border-r border-[var(--gs-border)] bg-[var(--gs-bg)] py-4 md:flex">
      <RailIcon label="Search">
        <IconSearch size={18} />
      </RailIcon>

      <div className="my-1 h-px w-6 bg-[var(--gs-border)]" />

      <RailIcon label="Dashboards" active>
        <IconGrid size={18} />
      </RailIcon>
      <RailIcon label="Explore">
        <IconCompass size={18} />
      </RailIcon>
      <RailIcon label="Alerting">
        <IconBell size={18} />
      </RailIcon>

      <div className="mt-auto">
        <RailIcon label="Configuration">
          <IconGear size={18} />
        </RailIcon>
      </div>
    </aside>
  );
}
