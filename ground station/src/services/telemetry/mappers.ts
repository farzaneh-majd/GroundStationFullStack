import type { StoredRawTelemetryPacket } from "@/types/telemetry";

type GqlPacket = {
  recordId: string; time: string; satelliteId: string; telemetryId: string; payload: string;
  decoded: { telemetryId: string; name: string; kind: StoredRawTelemetryPacket["decoded"]["kind"]; values: Record<string, number | string>; fields: StoredRawTelemetryPacket["decoded"]["fields"]; rawPayload: string; byteLength: number; };
};
export function fromGraphQLPacket(packet: GqlPacket): StoredRawTelemetryPacket {
  return {
    record_id: packet.recordId, time: packet.time, satellite_id: packet.satelliteId, tlm_id: packet.telemetryId, payload: packet.payload,
    decoded: { ...packet.decoded, tlmId: packet.decoded.telemetryId },
  };
}
export function toGraphQLPacketInput(packet: Record<string, unknown>) {
  return {
    satelliteId: packet.satellite_id ?? packet.satelliteId,
    telemetryId: packet.tlm_id ?? packet.tlmId,
    payload: packet.payload ?? packet.payload_str ?? packet.payloadHex,
    timestamp: packet.ts ?? packet.timestamp,
    timePrecision: packet.time_precision ?? packet.timePrecision,
  };
}
