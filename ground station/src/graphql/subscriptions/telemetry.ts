export const RAW_TELEMETRY_SUBSCRIPTION = /* GraphQL */ `
  subscription RawTelemetry($satelliteId: ID, $telemetryId: ID) {
    rawTelemetry(satelliteId: $satelliteId, telemetryId: $telemetryId) {
      recordId time satelliteId telemetryId payload
      decoded { telemetryId name kind rawPayload byteLength values fields { name value unit format } }
    }
  }
`;

export const TELEMETRY_POINT_SUBSCRIPTION = /* GraphQL */ `
  subscription TelemetryPoint($satelliteId: ID!, $channelId: ID, $field: String) {
    telemetryPoint(satelliteId: $satelliteId, channelId: $channelId, field: $field) {
      satelliteId channelId telemetryId field timestamp value unit quality
    }
  }
`;
