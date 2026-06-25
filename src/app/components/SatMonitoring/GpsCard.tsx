import { Card } from "@grafana/ui";
import HealthBadge from "./HealthBadge";
import { gpsData, sensorHealth } from "@/data/mockSatelliteData";

export default function GpsCard() {
  return (
    <Card>
      <Card.Heading>GPS</Card.Heading>
      <Card.Description>
        <HealthBadge state={sensorHealth.gps} />
        <p>Latitude: {gpsData.latitude}</p>
        <p>Longitude: {gpsData.longitude}</p>
        <p>Altitude: {gpsData.altitudeKm} km</p>
        <p>Speed: {gpsData.speedKms} km/s</p>
      </Card.Description>
    </Card>
  );
}
