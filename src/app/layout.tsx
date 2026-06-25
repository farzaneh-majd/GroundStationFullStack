import type { Metadata } from "next";
import "./globals.css";
import GrafanaProvider from "./components/GrafanaProvider";

export const metadata: Metadata = {
  title: "CubeSat Ground Station",
  description:
    "CubeSat telemetry dashboard using Next.js, Grafana UI, and InfluxDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GrafanaProvider>{children}</GrafanaProvider>
      </body>
    </html>
  );
}
