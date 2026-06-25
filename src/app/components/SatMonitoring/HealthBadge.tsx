/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@grafana/ui";
import { healthColor, type HealthState } from "@/data/mockSatelliteData";

export default function HealthBadge({ state }: { state: HealthState }) {
  return <Badge text={state.toUpperCase()} color={healthColor[state] as any} />;
}
