import { Card, Button } from "@grafana/ui";
import HealthBadge from "./HealthBadge";
import { satelliteStatus } from "@/data/mockSatelliteData";

export default function SatellitePanel() {
  return (
    <Card>
      <Card.Heading>Satellite Panel</Card.Heading>
      <Card.Description>
        <div className="flex flex-col gap-3">
          <div>
            <b>Satellite Mode:</b> {satelliteStatus.satelliteMode}
          </div>

          <div>
            <b>Actuator Health:</b>{" "}
            <HealthBadge state={satelliteStatus.actuatorHealth} />
          </div>

          <div>
            <b>Actuator Command:</b> {satelliteStatus.actuatorCommand}
          </div>

          <Button variant="primary">Send Actuator Command</Button>
        </div>
      </Card.Description>
    </Card>
  );
}
