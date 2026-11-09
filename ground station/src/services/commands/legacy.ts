import type { CommandDataSource } from "./contract";
import type { Telecommand } from "@/types/command";
async function body<T>
(response: Response): Promise<T> { const value = await response.json(); if (!response.ok) throw new Error(value?.error ?? `Request failed (${response.status})`); return value as T; }
export const legacyCommandDataSource: CommandDataSource = {
  async list(limit = 20) { return body<Telecommand[]>(await fetch(`/api/telecommands?limit=${limit}`, { cache: "no-store" })); },
  async send(input) { return body<Telecommand>(await fetch("/api/telecommands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) })); },
};
