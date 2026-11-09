import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket, TelemetryPacketFilters } from "@/types/telemetry";
import type { TelemetryCatalog, TelemetryHistoryInput, TelemetryPoint, TelemetrySeries } from "@/types/telemetry-domain";
export interface TelemetryDataSource {
  getCatalog(satelliteId?: string): Promise<TelemetryCatalog>;
  getHistory(input: TelemetryHistoryInput): Promise<TelemetrySeries>;
  subscribeTelemetry?(satelliteId: string, onPoint: (point: TelemetryPoint) => void, onError: (error: Error) => void, channelId?: string, field?: string): () => void;
  listRawPackets(filters?: TelemetryPacketFilters): Promise<StoredRawTelemetryPacket[]>;
  createRawPacket(packet: IncomingRawTelemetryPacket): Promise<StoredRawTelemetryPacket>;
  updateRawPacket(recordId: string, packet: IncomingRawTelemetryPacket): Promise<StoredRawTelemetryPacket>;
  deleteRawPacket(recordId: string): Promise<void>;
  subscribeRawPackets?(filters: TelemetryPacketFilters, onPacket: (packet: StoredRawTelemetryPacket) => void, onError: (error: Error) => void): () => void;
}
