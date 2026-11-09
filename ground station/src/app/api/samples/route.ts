import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { buildSample } from "@/utils/packet";
import { getSamples, writeSample } from "@/server/influx/samplesRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sampleType = searchParams.get("sampleType") || undefined;
    const limit = Number(searchParams.get("limit") || 100);

    const samples = await getSamples(sampleType, limit);

    return NextResponse.json(samples);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch samples" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sample = buildSample(body, randomUUID());

    await writeSample(sample);

    return NextResponse.json(sample, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create sample" },
      { status: 400 },
    );
  }
}
