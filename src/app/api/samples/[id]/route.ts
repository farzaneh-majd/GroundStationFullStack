import { NextResponse } from "next/server";
import { buildSample } from "@/lib/packet";
import { deleteSampleById, isSafeId, writeSample } from "@/lib/influx";

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

    await deleteSampleById(recordId);

    const updatedSample = buildSample(body, recordId);

    await writeSample(updatedSample);

    return NextResponse.json(updatedSample);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update sample" },
      { status: 500 },
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

    return NextResponse.json({
      deleted: true,
      recordId,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete sample" },
      { status: 500 },
    );
  }
}
