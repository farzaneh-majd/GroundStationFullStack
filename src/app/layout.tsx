import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CubeSat Ground Station",
  description: "CubeSat ground station dashboard using Next.js, Grafana UI, and InfluxDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}