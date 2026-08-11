import GrafanaLineChart from "@/components/charts/GrafanaLineChart";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatTime, toNumber } from "@/utils/format";

type ChartPoint = {
  time: string;
  label: string;
  [key: string]: number | string | undefined;
};

function buildChartData(packets: StoredRawTelemetryPacket[], tlmId: string): ChartPoint[] {
  return packets
    .filter((packet) => String(packet.tlm_id) === tlmId)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((packet) => {
      const point: ChartPoint = {
        time: packet.time,
        label: formatTime(packet.time),
      };

      for (const [key, value] of Object.entries(packet.decoded.values)) {
        const num = toNumber(value);
        if (num !== undefined) point[key] = num;
      }

      return point;
    });
}

function getNumericKeys(data: ChartPoint[]) {
  const keys = new Set<string>();

  for (const point of data) {
    for (const [key, value] of Object.entries(point)) {
      if (key !== "time" && key !== "label" && typeof value === "number") {
        keys.add(key);
      }
    }
  }

  return Array.from(keys);
}

export default function RawTelemetryCharts({ packets }: { packets: StoredRawTelemetryPacket[] }) {
  const imuData = buildChartData(packets, "2");
  const envData = buildChartData(packets, "3");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div>
        <div className="mb-2 text-xs font-medium text-[var(--gs-muted)]">IMU (tlm_id = 2)</div>
        <GrafanaLineChart
          data={imuData}
          series={getNumericKeys(imuData).map((key) => ({ key, label: key }))}
          emptyTitle="No IMU packets yet"
          emptyMessage="Numeric decoded fields for tlm_id=2 will appear here once packets arrive."
        />
      </div>
      <div>
        <div className="mb-2 text-xs font-medium text-[var(--gs-muted)]">Environment (tlm_id = 3)</div>
        <GrafanaLineChart
          data={envData}
          series={getNumericKeys(envData).map((key) => ({ key, label: key }))}
          emptyTitle="No environment packets yet"
          emptyMessage="Numeric decoded fields for tlm_id=3 will appear here once packets arrive."
        />
      </div>
    </div>
  );
}
