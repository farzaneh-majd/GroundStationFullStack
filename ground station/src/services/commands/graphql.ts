import { executeGraphQL } from "@/lib/graphql/client";
import { COMMANDS_QUERY } from "@/graphql/queries/commands";
import { SEND_COMMAND_MUTATION } from "@/graphql/mutations/commands";
import type { CommandDataSource } from "./contract";
import type { Telecommand } from "@/types/command";
type GqlCommand = { commandId: string; satelliteId?: string; commandHex: string; status: string; time: string };
const map = (x: GqlCommand): Telecommand => ({ command_id: x.commandId, satellite_id: x.satelliteId, command_hex: x.commandHex, status: x.status, time: x.time });
export const graphQLCommandDataSource: CommandDataSource = {
  async list(limit = 20, satelliteId) { const d = await executeGraphQL<{ commands: GqlCommand[] }, Record<string, unknown>>(COMMANDS_QUERY, { limit, satelliteId }); return d.commands.map(map); },
  async send(input) { const d = await executeGraphQL<{ sendCommand: GqlCommand }, Record<string, unknown>>(SEND_COMMAND_MUTATION, { input: { satelliteId: input.satellite_id, commandHex: input.command_hex } }); return map(d.sendCommand); },
};
