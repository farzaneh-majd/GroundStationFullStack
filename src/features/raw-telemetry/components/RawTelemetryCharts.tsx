import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatTime, toNumber } from "@/utils/format";

type ChartPoint = {
  time: string;
  label: string;
  [key: string]: number | string | undefined;
};

const lineColors = ["#73BF69", "#F2CC0C", "#5794F2", "#FF9830", "#B877D9", "#F2495C"];

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

function TelemetryLineChart({ data }: { data: ChartPoint[] }) {
  const keys = getNumericKeys(data);

  if (data.length === 0 || keys.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded bg-[#111217] text-sm text-[#9fa7b3]">
        No numeric decoded values yet.
      </div>
    );
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#2f3240" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#9fa7b3", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9fa7b3", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#181b24",
              border: "1px solid #2f3240",
              color: "#d8d9da",
            }}
          />
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              dot={false}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RawTelemetryCharts({ packets }: { packets: StoredRawTelemetryPacket[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <TelemetryLineChart data={buildChartData(packets, "2")} />
      <TelemetryLineChart data={buildChartData(packets, "3")} />
    </div>
  );
}
