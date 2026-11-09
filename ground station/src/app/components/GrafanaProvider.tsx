"use client";

import { ReactNode, useMemo } from "react";
import { createTheme } from "@grafana/data";
import { GlobalStyles, ThemeContext } from "@grafana/ui";

export default function GrafanaProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        colors: {
          mode: "dark",
        },
      }),
    [],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <GlobalStyles />
      {children}
    </ThemeContext.Provider>
  );
}
