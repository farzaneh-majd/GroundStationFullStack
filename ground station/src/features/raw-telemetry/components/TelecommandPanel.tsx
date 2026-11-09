"use client";

import { useState } from "react";
import { Button } from "@grafana/ui";
import TextField from "@/components/ui/TextField";
import { useTelecommands } from "@/hooks/useTelecommands";

export default function TelecommandPanel({ satelliteId }: { satelliteId: string }) {
  const [commandHex, setCommandHex] = useState("01");
  const { commands, error, sending, send } = useTelecommands(20, satelliteId);

  async function handleSend() {
    await send({ satellite_id: satelliteId, command_hex: commandHex });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <TextField label="Command bytes (HEX)" value={commandHex} onChange={setCommandHex} helper="Command transport is isolated behind the data-source layer; GraphQL mode sends a mutation to the Python backend." />
        </div>
        <Button onClick={handleSend} disabled={sending}>{sending ? "Sending..." : "Send command"}</Button>
      </div>
      {error && <div className="text-sm text-[#F2495C]">{error}</div>}
      <div className="max-h-48 overflow-auto font-mono text-xs">
        {commands.length === 0 ? <div className="text-[var(--gs-muted)]">No commands yet.</div> : commands.map((command) => (
          <div key={command.command_id} className="grid grid-cols-[100px_1fr_110px] gap-3 border-b border-[var(--gs-border)] py-2">
            <span>{command.command_hex}</span><span>{new Date(command.time).toLocaleTimeString()}</span>
            <span>{command.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
