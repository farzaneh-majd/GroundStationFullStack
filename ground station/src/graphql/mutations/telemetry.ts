export const CREATE_RAW_PACKET_MUTATION = /* GraphQL */ `
  mutation CreateRawTelemetryPacket($input: RawTelemetryPacketInput!) {
    createRawTelemetryPacket(input: $input) { recordId time satelliteId telemetryId payload decoded { telemetryId name kind rawPayload byteLength values fields { name value unit format } } }
  }
`;
export const UPDATE_RAW_PACKET_MUTATION = /* GraphQL */ `
  mutation UpdateRawTelemetryPacket($recordId: ID!, $input: RawTelemetryPacketInput!) {
    updateRawTelemetryPacket(recordId: $recordId, input: $input) { recordId time satelliteId telemetryId payload decoded { telemetryId name kind rawPayload byteLength values fields { name value unit format } } }
  }
`;
export const DELETE_RAW_PACKET_MUTATION = /* GraphQL */ `
  mutation DeleteRawTelemetryPacket($recordId: ID!) { deleteRawTelemetryPacket(recordId: $recordId) }
`;
