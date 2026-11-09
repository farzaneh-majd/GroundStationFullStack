import type { SendCommandInput, Telecommand } from "@/types/command";
export interface CommandDataSource { list(limit?: number, satelliteId?: string): Promise<Telecommand[]>; send(input: SendCommandInput): Promise<Telecommand>; }
