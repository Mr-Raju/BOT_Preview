import { NextResponse, type NextRequest } from "next/server";
import { publishDraft } from "@/lib/flowStore";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await context.params;
  try {
    const published = await publishDraft(flowId);
    return NextResponse.json({ flow: published });
  } catch {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }
}

