export type CommandStatus = "CREATED" | "VALIDATED" | "QUEUED" | "SENT" | "ACKNOWLEDGED" | "FAILED" | "REJECTED" | "TIMEOUT" | string;
export type Telecommand = { command_id: string; satellite_id?: string; command_hex: string; status: CommandStatus; time: string; };
export type SendCommandInput = { satellite_id: string; command_hex: string; };
