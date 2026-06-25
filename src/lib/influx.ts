/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import type { StoredSample } from "./packet";

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

if (!url || !token || !org || !bucket) {
  throw new Error("Missing InfluxDB environment variables");
}

const client = new InfluxDB({ url, token });

export const queryApi = client.getQueryApi(org);

export function isSafeId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

function escapeFluxString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function writeSample(sample: StoredSample) {
  const writeApi = client.getWriteApi(org, bucket, "ms");

  const point = new Point("tlm_samples")
    .tag("recordId", sample.recordId)
    .tag("sampleType", sample.sampleType)
    .tag("tlmId", sample.tlmId)
    .stringField("sync", sample.sync)
    .intField("len", sample.len)
    .stringField("payloadHex", sample.payloadHex)
    .stringField("dataHex", sample.dataHex)
    .stringField("crc", sample.crc)
    .stringField("unit", sample.unit || "")
    .timestamp(new Date(sample.time));

  if (sample.value !== undefined) point.floatField("value", sample.value);
  if (sample.x !== undefined) point.floatField("x", sample.x);
  if (sample.y !== undefined) point.floatField("y", sample.y);
  if (sample.z !== undefined) point.floatField("z", sample.z);

  writeApi.writePoint(point);
  await writeApi.close();
}

export async function getSamples(sampleType?: string) {
  const typeFilter = sampleType
    ? `|> filter(fn: (r) => r.sampleType == "${escapeFluxString(sampleType)}")`
    : "";

  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "tlm_samples")
      ${typeFilter}
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 100)
  `;

  const rows = await queryApi.collectRows(fluxQuery);

  return rows.map((row: any) => ({
    recordId: row.recordId,
    time: row._time,
    sampleType: row.sampleType,
    tlmId: row.tlmId,
    sync: row.sync,
    len: Number(row.len ?? 0),
    payloadHex: row.payloadHex,
    dataHex: row.dataHex,
    crc: row.crc,
    value: row.value !== undefined ? Number(row.value) : undefined,
    x: row.x !== undefined ? Number(row.x) : undefined,
    y: row.y !== undefined ? Number(row.y) : undefined,
    z: row.z !== undefined ? Number(row.z) : undefined,
    unit: row.unit,
  }));
}

export async function deleteSampleById(recordId: string) {
  if (!isSafeId(recordId)) {
    throw new Error("Invalid recordId");
  }

  const response = await fetch(
    `${url}/api/v2/delete?org=${encodeURIComponent(org!)}&bucket=${encodeURIComponent(bucket!)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: "1970-01-01T00:00:00Z",
        stop: new Date(Date.now() + 60_000).toISOString(),
        predicate: `_measurement="tlm_samples" AND recordId="${recordId}"`,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Influx delete failed: ${text}`);
  }
}
