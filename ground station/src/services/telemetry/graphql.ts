import { executeGraphQL } from "@/lib/graphql/client";
import { subscribeGraphQL } from "@/lib/graphql/subscription";
import { RAW_TELEMETRY_PACKETS_QUERY, TELEMETRY_CATALOG_QUERY, TELEMETRY_HISTORY_QUERY } from "@/graphql/queries/telemetry";
import { CREATE_RAW_PACKET_MUTATION, UPDATE_RAW_PACKET_MUTATION, DELETE_RAW_PACKET_MUTATION } from "@/graphql/mutations/telemetry";
import { RAW_TELEMETRY_SUBSCRIPTION, TELEMETRY_POINT_SUBSCRIPTION } from "@/graphql/subscriptions/telemetry";
import type { TelemetryDataSource } from "./contract";
import { fromGraphQLPacket, toGraphQLPacketInput } from "./mappers";
import type { TelemetryCatalog, TelemetryPoint, TelemetrySeries } from "@/types/telemetry-domain";

type GqlPacket = Parameters<typeof fromGraphQLPacket>[0];
export const graphQLTelemetryDataSource: TelemetryDataSource = {
  async getCatalog(satelliteId) {
    const data = await executeGraphQL<{ telemetryCatalog: TelemetryCatalog }, Record<string, unknown>>(TELEMETRY_CATALOG_QUERY, { satelliteId });
    return data.telemetryCatalog;
  },
  async getHistory(input) {
    const data = await executeGraphQL<{ telemetryHistory: TelemetrySeries }, Record<string, unknown>>(TELEMETRY_HISTORY_QUERY, { input });
    return data.telemetryHistory;
  },
  subscribeTelemetry(satelliteId, onPoint, onError, channelId, field) {
    return subscribeGraphQL<{ telemetryPoint: TelemetryPoint }>(TELEMETRY_POINT_SUBSCRIPTION, { satelliteId, channelId, field }, { next: (data) => onPoint(data.telemetryPoint), error: onError });
  },
  async listRawPackets(filters = {}) {
    const data = await executeGraphQL<{ rawTelemetryPackets: GqlPacket[] }, Record<string, unknown>>(RAW_TELEMETRY_PACKETS_QUERY, {
      filter: { satelliteId: filters.satellite_id, telemetryId: filters.tlm_id }, limit: filters.limit ?? 200,
    });
    return data.rawTelemetryPackets.map(fromGraphQLPacket);
  },
  async createRawPacket(packet) {
    const data = await executeGraphQL<{ createRawTelemetryPacket: GqlPacket }, Record<string, unknown>>(CREATE_RAW_PACKET_MUTATION, { input: toGraphQLPacketInput(packet as Record<string, unknown>) });
    return fromGraphQLPacket(data.createRawTelemetryPacket);
  },
  async updateRawPacket(recordId, packet) {
    const data = await executeGraphQL<{ updateRawTelemetryPacket: GqlPacket }, Record<string, unknown>>(UPDATE_RAW_PACKET_MUTATION, { recordId, input: toGraphQLPacketInput(packet as Record<string, unknown>) });
    return fromGraphQLPacket(data.updateRawTelemetryPacket);
  },
  async deleteRawPacket(recordId) { await executeGraphQL<{ deleteRawTelemetryPacket: boolean }, Record<string, unknown>>(DELETE_RAW_PACKET_MUTATION, { recordId }); },
  subscribeRawPackets(filters, onPacket, onError) {
    return subscribeGraphQL<{ rawTelemetry: GqlPacket }>(RAW_TELEMETRY_SUBSCRIPTION, { satelliteId: filters.satellite_id, telemetryId: filters.tlm_id }, { next: (data) => onPacket(fromGraphQLPacket(data.rawTelemetry)), error: onError });
  },
};
