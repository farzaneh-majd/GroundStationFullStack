import { Badge } from "@grafana/ui";
import { healthColor } from "@/data/data";
import type { HealthState } from "@/types/satellite";

export const healthHexColor: Record<HealthState, string> = {
  normal: "var(--gs-green)",
  warning: "var(--gs-orange)",
  error: "var(--gs-red)",
};

export default function HealthBadge({ state }: { state: HealthState }) {
  return <Badge text={state.toUpperCase()} color={healthColor[state]} />;
}
