export const SEND_COMMAND_MUTATION = /* GraphQL */ `
  mutation SendCommand($input: SendCommandInput!) {
    sendCommand(input: $input) { commandId satelliteId commandHex status time }
  }
`;
