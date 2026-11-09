export const RAW_TELEMETRY_PACKETS_QUERY = /* GraphQL */ `
  query RawTelemetryPackets($filter: RawTelemetryFilterInput, $limit: Int = 200) {
    rawTelemetryPackets(filter: $filter, limit: $limit) {
      recordId time satelliteId telemetryId payload
      decoded { telemetryId name kind rawPayload byteLength values fields { name value unit format } }
    }
  }
`;

export const TELEMETRY_CATALOG_QUERY = /* GraphQL */ `
  query TelemetryCatalog($satelliteId: ID) {
    telemetryCatalog(satelliteId: $satelliteId) {
      version satelliteId
      subsystems { id name description }
      channels {
        id telemetryId satelliteId subsystem name description kind endian source sampleRateHz
        fields { key name format unit endian enumMap limits { warningLow warningHigh criticalLow criticalHigh } }
      }
    }
  }
`;

export const TELEMETRY_HISTORY_QUERY = /* GraphQL */ `
  query TelemetryHistory($input: TelemetryHistoryInput!) {
    telemetryHistory(input: $input) {
      field
      channel { id telemetryId satelliteId subsystem name description kind endian source sampleRateHz fields { key name format unit } }
      points { satelliteId channelId telemetryId field timestamp value unit quality }
    }
  }
`;

export const TELEMETRY_SUMMARIES_QUERY = /* GraphQL */ `
  query TelemetrySummaries($satelliteId: ID!, $channelId: ID, $field: String, $start: DateTime, $end: DateTime, $limit: Int = 1000) {
    telemetrySummaries(satelliteId: $satelliteId, channelId: $channelId, field: $field, start: $start, end: $end, limit: $limit) {
      satelliteId channelId field windowStart count mean minimum maximum stddev
    }
  }
`;
