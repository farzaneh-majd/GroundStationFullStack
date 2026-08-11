import type { CSSProperties } from "react";

/**
 * Shared recharts theming so every trend chart in the app (raw telemetry,
 * telemetry, future panels) looks like it came from the same Grafana
 * dashboard instead of being styled ad-hoc per component.
 */

export const GRAFANA_LINE_COLORS = [
  "#5794F2", // blue
  "#73BF69", // green
  "#FF9830", // orange
  "#F2495C", // red
  "#B877D9", // purple
  "#F2CC0C", // yellow
];

export const chartGridProps = {
  stroke: "var(--gs-border)",
  strokeDasharray: "3 3",
  vertical: false,
};

export const chartAxisTickStyle = {
  fill: "var(--gs-muted)",
  fontSize: 11,
  fontFamily: "var(--gs-font-sans)",
};

export const chartTooltipStyle: CSSProperties = {
  background: "var(--gs-elevated)",
  border: "1px solid var(--gs-border)",
  borderRadius: 3,
  color: "var(--gs-text)",
  fontSize: 12,
  boxShadow: "var(--gs-shadow)",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "var(--gs-muted)",
  marginBottom: 4,
};
