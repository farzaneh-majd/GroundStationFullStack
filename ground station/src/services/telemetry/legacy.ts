import type { TelemetryDataSource } from "./contract";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { buildLegacyTelemetryCatalog } from "./catalog";
import { packetToTelemetryPoints } from "./points";
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status})`);
  return body as T;
}
export const legacyTelemetryDataSource: TelemetryDataSource = {
  async getCatalog(satelliteId) { return buildLegacyTelemetryCatalog(satelliteId); },
  async getHistory(input) {
    const catalog = buildLegacyTelemetryCatalog(input.satelliteId);
    const channel = catalog.channels.find((item) => item.id === input.channelId || item.telemetryId === input.channelId);
    if (!channel) throw new Error(`Unknown telemetry channel: ${input.channelId}`);
    const params = new URLSearchParams({ limit: String(input.limit ?? 1000), satellite_id: input.satelliteId, tlm_id: channel.telemetryId });
    const packets = await request<StoredRawTelemetryPacket[]>(`/api/telemetry/packets?${params}`);
    const from = new Date(input.from).getTime();
    const to = new Date(input.to).getTime();
    const points = packets
      .flatMap((packet) => packetToTelemetryPoints(packet, catalog))
      .filter((point) => point.field === input.field)
      .filter((point) => { const time = new Date(point.timestamp).getTime(); return time >= from && time <= to; })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return { channel, field: input.field, points };
  },
  async listRawPackets(filters = {}) {
    const params = new URLSearchParams({ limit: String(filters.limit ?? 200) });
    if (filters.satellite_id) params.set("satellite_id", filters.satellite_id);
    if (filters.tlm_id) params.set("tlm_id", filters.tlm_id);
    return request<StoredRawTelemetryPacket[]>(`/api/telemetry/packets?${params}`);
  },
  createRawPacket(packet) { return request<StoredRawTelemetryPacket>("/api/telemetry/packets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packet) }); },
  updateRawPacket(recordId, packet) { return request<StoredRawTelemetryPacket>(`/api/telemetry/packets/${recordId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packet) }); },
  async deleteRawPacket(recordId) { await request(`/api/telemetry/packets/${recordId}`, { method: "DELETE" }); },
};
