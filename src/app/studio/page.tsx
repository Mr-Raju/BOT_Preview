import { listDrafts } from "@/lib/flowStore";
import StudioClient from "./studio-client";

export default async function StudioPage() {
  const flows = await listDrafts();
  const initialFlowId = flows[0]?.id ?? null;

  return (
    <StudioClient initialFlows={flows} initialFlowId={initialFlowId} />
  );
}

