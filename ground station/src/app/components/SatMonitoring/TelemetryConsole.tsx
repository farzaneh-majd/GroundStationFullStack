import { Card } from "@grafana/ui";
import { consoleMessages } from "@/data/mockSatelliteData";

export default function TelemetryConsole() {
  return (
    <Card>
      <Card.Heading>Telemetry Console</Card.Heading>
      <Card.Description>
        <div className="min-h-[180px] rounded-lg bg-black p-4 font-mono text-sm text-green-400">
          {consoleMessages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </Card.Description>
    </Card>
  );
}
