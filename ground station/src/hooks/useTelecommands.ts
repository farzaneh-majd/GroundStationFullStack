"use client";
import { useCallback, useEffect, useState } from "react";
import { commandDataSource } from "@/services/commands";
import type { SendCommandInput, Telecommand } from "@/types/command";
export function useTelecommands(limit = 20, satelliteId?: string) {
  const [commands, setCommands] = useState<Telecommand[]>([]); const [error, setError] = useState<string | null>(null); const [sending, setSending] = useState(false);
  const refresh = useCallback(async () => { try { setError(null); setCommands(await commandDataSource.list(limit, satelliteId)); } catch (e) { setError(e instanceof Error ? e.message : "Failed to load commands"); } }, [limit, satelliteId]);
  const send = useCallback(async (input: SendCommandInput) => {
    setSending(true);
    try {
      setError(null);
      const result = await commandDataSource.send(input);
      await refresh();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send command";
      setError(message);
      throw error;
    } finally {
      setSending(false);
    }
  }, [refresh]);
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 3000); return () => window.clearInterval(timer); }, [refresh]);
  return { commands, error, sending, refresh, send };
}
