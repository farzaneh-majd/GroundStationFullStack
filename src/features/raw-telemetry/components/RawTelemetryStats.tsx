import StatCard from "@/components/ui/StatCard";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatNumber, vectorMagnitude } from "@/utils/format";

function latestByTlmId(packets: StoredRawTelemetryPacket[], tlmId: string) {
  return packets.find((packet) => String(packet.tlm_id) === tlmId);
}

export default function RawTelemetryStats({ packets }: { packets: StoredRawTelemetryPacket[] }) {
  const latestLed = latestByTlmId(packets, "1");
  const latestImu = latestByTlmId(packets, "2");
  const imuMagnitude = vectorMagnitude(
    latestImu?.decoded.values.accel_x,
    latestImu?.decoded.values.accel_y,
    latestImu?.decoded.values.accel_z,
  );

  const satellites = new Set(packets.map((packet) => packet.satellite_id));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Latest LED State"
        value={String(latestLed?.decoded.values.led_state ?? "--")}
        subtitle={latestLed ? `tlm_id=${latestLed.tlm_id}` : "Waiting for LED packet"}
      />

      <StatCard
        title="IMU |Accel|"
        value={latestImu ? formatNumber(imuMagnitude) : "--"}
        unit="m/s²"
        subtitle={latestImu ? "computed from accel_x/y/z" : "Waiting for IMU packet"}
      />

      <StatCard
        title="Packets Stored"
        value={String(packets.length)}
        subtitle="API limit window"
      />

      <StatCard
        title="Satellites Seen"
        value={String(satellites.size)}
        subtitle="unique satellite_id tags"
        status={satellites.size > 0 ? "nominal" : "muted"}
      />
    </div>
  );
}
