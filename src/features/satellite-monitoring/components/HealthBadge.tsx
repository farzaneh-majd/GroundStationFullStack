import { Badge } from "@grafana/ui";
import { healthColor } from "@/data/mockSatelliteData";
import type { HealthState } from "@/types/satellite";

export default function HealthBadge({ state }: { state: HealthState }) {
  return <Badge text={state.toUpperCase()} color={healthColor[state]} />;
}
