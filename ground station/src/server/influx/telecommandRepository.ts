/* eslint-disable @typescript-eslint/no-explicit-any */
import { Point } from "@influxdata/influxdb-client";
import { randomUUID } from "crypto";
import { getWriteApi, influxConfig, queryApi } from "./client";

export const TELECOMMAND_MEASUREMENT = "commands";

export type StoredTelecommand = {
  command_id: string;
  satellite_id: string;
  command_hex: string;
  status: string;
  time: string;
};

export async function createTelecommand(input: {
  satellite_id?: string;
  command_hex?: string;
}): Promise<StoredTelecommand> {
  const satelliteId = String(input.satellite_id ?? "SAT-A");
  const commandHex = String(input.command_hex ?? "").replace(/\s+/g, "").toUpperCase();

  if (!commandHex || !/^[0-9A-F]+$/.test(commandHex) || commandHex.length % 2 !== 0) {
    throw new Error("command_hex must contain complete hexadecimal bytes");
  }

  const commandId = randomUUID();
  const time = new Date();
  const writeApi = getWriteApi();
  writeApi.writePoint(
    new Point(TELECOMMAND_MEASUREMENT)
      .tag("command_id", commandId)
      .tag("satellite_id", satelliteId)
      .stringField("command_hex", commandHex)
      .stringField("status", "queued")
      .timestamp(time),
  );
  await writeApi.close();

  return {
    command_id: commandId,
    satellite_id: satelliteId,
    command_hex: commandHex,
    status: "queued",
    time: time.toISOString(),
  };
}

export async function getTelecommands(limit = 100): Promise<StoredTelecommand[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const query = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -24h)
      |> filter(fn: (r) => r._measurement == "${TELECOMMAND_MEASUREMENT}")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${safeLimit})
  `;
  const rows = await queryApi.collectRows(query);
  return (rows as any[]).map((row) => ({
    command_id: String(row.command_id),
    satellite_id: String(row.satellite_id),
    command_hex: String(row.command_hex ?? ""),
    status: String(row.status ?? "unknown"),
    time: new Date(row._time).toISOString(),
  }));
}
