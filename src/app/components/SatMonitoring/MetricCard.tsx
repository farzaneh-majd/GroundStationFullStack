import { Card } from "@grafana/ui";
import HealthBadge from "./HealthBadge";
import type { HealthState } from "@/data/mockSatelliteData";

type Props = {
  title: string;
  value: string | number;
  unit?: string;
  health: HealthState;
};

export default function MetricCard({ title, value, unit, health }: Props) {
  return (
    <Card>
      <Card.Heading>{title}</Card.Heading>
      <Card.Description>
        <div className="text-3xl font-bold text-white">
          {value} {unit}
        </div>
        <HealthBadge state={health} />
      </Card.Description>
    </Card>
  );
}
