import { NextResponse } from "next/server";
import { listDrafts } from "@/lib/flowStore";

export async function GET() {
  const flows = await listDrafts();
  return NextResponse.json({ flows });
}

