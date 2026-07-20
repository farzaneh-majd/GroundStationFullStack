/* eslint-disable @typescript-eslint/no-explicit-any */
import { Point } from "@influxdata/influxdb-client";
import type { StoredSample } from "@/types/sample";
import {
  deleteFromInflux,
  escapeFluxString,
  getWriteApi,
  influxConfig,
  isSafeId,
  queryApi,
} from "./client";

const SAMPLE_MEASUREMENT = "tlm_samples";

export async function writeSample(sample: StoredSample) {
  const writeApi = getWriteApi();

  const point = new Point(SAMPLE_MEASUREMENT)
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

export async function getSamples(sampleType?: string, limit = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const typeFilter = sampleType
    ? `|> filter(fn: (r) => r.sampleType == "${escapeFluxString(sampleType)}")`
    : "";

  const fluxQuery = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "${SAMPLE_MEASUREMENT}")
      ${typeFilter}
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${safeLimit})
  `;

  const rows = await queryApi.collectRows(fluxQuery);

  return rows.map((row: any): StoredSample => ({
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

  await deleteFromInflux({
    measurement: SAMPLE_MEASUREMENT,
    predicate: `recordId="${recordId}"`,
  });
}
