import { NextResponse } from "next/server";
import { buildSample } from "@/utils/packet";
import { isSafeId } from "@/server/influx/client";
import {
  deleteSampleById,
  writeSample,
} from "@/server/influx/samplesRepository";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const recordId = params.id;

    if (!isSafeId(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    const body = await request.json();
    const updatedSample = buildSample(body, recordId);

    await deleteSampleById(recordId);
    await writeSample(updatedSample);

    return NextResponse.json(updatedSample);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update sample" },
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
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
    }

    await deleteSampleById(recordId);

    return NextResponse.json({ deleted: true, recordId });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete sample" },
      { status: 500 },
    );
  }
}
