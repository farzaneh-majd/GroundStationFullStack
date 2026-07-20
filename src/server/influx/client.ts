import { InfluxDB } from "@influxdata/influxdb-client";

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing InfluxDB environment variable: ${name}`);
  }

  return value;
}

const url = readRequiredEnv("INFLUX_URL");
const token = readRequiredEnv("INFLUX_TOKEN");
const org = readRequiredEnv("INFLUX_ORG");
const bucket = readRequiredEnv("INFLUX_BUCKET");

export const influxConfig = {
  url,
  token,
  org,
  bucket,
};

export const influxClient = new InfluxDB({ url, token });
export const queryApi = influxClient.getQueryApi(org);

export function getWriteApi() {
  return influxClient.getWriteApi(org, bucket, "ms");
}

export function escapeFluxString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function isSafeId(id: string) {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export async function deleteFromInflux(params: {
  measurement: string;
  predicate: string;
}) {
  const response = await fetch(
    `${url}/api/v2/delete?org=${encodeURIComponent(org)}&bucket=${encodeURIComponent(bucket)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: "1970-01-01T00:00:00Z",
        stop: new Date(Date.now() + 60_000).toISOString(),
        predicate: `_measurement="${params.measurement}" AND ${params.predicate}`,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Influx delete failed: ${text}`);
  }
}
