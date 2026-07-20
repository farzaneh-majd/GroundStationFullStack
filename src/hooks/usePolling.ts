"use client";

import { useEffect } from "react";

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  useEffect(() => {
    void callback();

    const interval = window.setInterval(() => {
      void callback();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [callback, intervalMs]);
}
