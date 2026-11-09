export const COMMANDS_QUERY = /* GraphQL */ `
  query Commands($satelliteId: ID, $limit: Int = 20) {
    commands(satelliteId: $satelliteId, limit: $limit) { commandId satelliteId commandHex status time }
  }
`;
