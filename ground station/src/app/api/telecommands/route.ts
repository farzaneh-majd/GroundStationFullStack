import { NextResponse } from "next/server";
import { createTelecommand, getTelecommands } from "@/server/influx/telecommandRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 100);
    return NextResponse.json(await getTelecommands(limit));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read telecommands" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createTelecommand(await request.json()), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue telecommand" },
      { status: 400 },
    );
  }
}
