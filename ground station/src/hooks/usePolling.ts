"use client";

import { useEffect } from "react";

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  useEffect(() => {
    void callback();

    if (intervalMs <= 0) return;

    const interval = window.setInterval(() => {
      void callback();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [callback, intervalMs]);
}
