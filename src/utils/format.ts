export function toNumber(value: unknown): number | undefined {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function formatNumber(value: unknown, digits = 2) {
  const num = toNumber(value);
  if (num === undefined) return "--";
  return num.toFixed(digits);
}

export function formatTime(time?: string) {
  if (!time) return "--";

  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(time?: string) {
  if (!time) return "--";

  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString();
}

export function vectorMagnitude(x?: unknown, y?: unknown, z?: unknown) {
  const nx = toNumber(x) ?? 0;
  const ny = toNumber(y) ?? 0;
  const nz = toNumber(z) ?? 0;

  return Math.sqrt(nx * nx + ny * ny + nz * nz);
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
