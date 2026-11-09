import { NextResponse } from "next/server";
import { isSafeId } from "@/server/influx/client";
import {
  deleteRawTelemetryPacket,
  normalizeIncomingRawPacket,
  writeRawTelemetryPacket,
} from "@/server/influx/rawTelemetryRepository";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const recordId = params.id;

    if (!isSafeId(recordId)) {
      return NextResponse.json({ error: "Invalid record_id" }, { status: 400 });
    }

    const body = await request.json();
    const packet = normalizeIncomingRawPacket(body, recordId);

    await deleteRawTelemetryPacket(recordId);
    await writeRawTelemetryPacket(packet);

    return NextResponse.json(packet);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update raw telemetry packet",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const recordId = params.id;

    if (!isSafeId(recordId)) {
      return NextResponse.json({ error: "Invalid record_id" }, { status: 400 });
    }

    await deleteRawTelemetryPacket(recordId);

    return NextResponse.json({ deleted: true, record_id: recordId });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete raw telemetry packet" },
      { status: 500 },
    );
  }
}
