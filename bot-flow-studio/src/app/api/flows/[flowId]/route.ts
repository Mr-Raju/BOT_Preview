import { NextResponse, type NextRequest } from "next/server";
import { FlowSchema } from "@/lib/flowSchema";
import { readDraft, writeDraft } from "@/lib/flowStore";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await context.params;
  try {
    const flow = await readDraft(flowId);
    return NextResponse.json({ flow });
  } catch {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ flowId: string }> },
) {
  const { flowId } = await context.params;
  const body = (await req.json()) as unknown;
  const parsed = FlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid flow", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (parsed.data.id !== flowId) {
    return NextResponse.json(
      { error: "Flow id mismatch" },
      { status: 400 },
    );
  }
  const saved = await writeDraft(parsed.data);
  return NextResponse.json({ flow: saved });
}

