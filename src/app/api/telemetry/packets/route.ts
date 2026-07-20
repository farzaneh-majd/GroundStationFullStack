import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  getRawTelemetryPackets,
  normalizeIncomingRawPacket,
  writeRawTelemetryPacket,
} from "@/server/influx/rawTelemetryRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const packets = await getRawTelemetryPackets({
      satellite_id: searchParams.get("satellite_id") || undefined,
      tlm_id: searchParams.get("tlm_id") || undefined,
      limit: Number(searchParams.get("limit") || 100),
    });

    return NextResponse.json(packets);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch raw telemetry packets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const packet = normalizeIncomingRawPacket(body, randomUUID());

    await writeRawTelemetryPacket(packet);

    return NextResponse.json(packet, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to write raw telemetry packet",
      },
      { status: 400 },
    );
  }
}
