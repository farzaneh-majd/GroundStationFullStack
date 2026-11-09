import { Card } from "@grafana/ui";
import HealthBadge from "./HealthBadge";
import { imuData, sensorHealth } from "@/data/mockSatelliteData";

export default function ImuCards() {
  return (
    <>
      <Card>
        <Card.Heading>Gyroscope</Card.Heading>
        <Card.Description>
          <HealthBadge state={sensorHealth.gyroscope} />
          <p>X: {imuData.gyroscope.x} °/s</p>
          <p>Y: {imuData.gyroscope.y} °/s</p>
          <p>Z: {imuData.gyroscope.z} °/s</p>
        </Card.Description>
      </Card>

      <Card>
        <Card.Heading>Magnetometer</Card.Heading>
        <Card.Description>
          <HealthBadge state={sensorHealth.magnetometer} />
          <p>X: {imuData.magnetometer.x} μT</p>
          <p>Y: {imuData.magnetometer.y} μT</p>
          <p>Z: {imuData.magnetometer.z} μT</p>
        </Card.Description>
      </Card>
    </>
  );
}
