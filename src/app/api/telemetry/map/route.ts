import { NextResponse } from "next/server";
import { telemetryMap, telemetryMapVersion } from "@/data/telemetryMap";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    version: telemetryMapVersion,
    telemetryMap,
  });
}
