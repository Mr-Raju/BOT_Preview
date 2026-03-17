import path from "node:path";
import fs from "node:fs/promises";
import { FlowSchema, type Flow, type FlowSummary } from "@/lib/flowSchema";

const DRAFTS_DIR = path.join(process.cwd(), "flows", "drafts");
const PUBLISHED_DIR = path.join(process.cwd(), "flows", "published");

async function ensureDirs() {
  await fs.mkdir(DRAFTS_DIR, { recursive: true });
  await fs.mkdir(PUBLISHED_DIR, { recursive: true });
}

function draftPath(flowId: string) {
  return path.join(DRAFTS_DIR, `${flowId}.json`);
}

function publishedPath(flowId: string, version: number) {
  return path.join(PUBLISHED_DIR, `${flowId}.v${version}.json`);
}

async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function writeJsonFile(filePath: string, data: unknown) {
  const raw = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(filePath, raw, "utf8");
}

export async function listDrafts(): Promise<FlowSummary[]> {
  await ensureDirs();
  const entries = await fs.readdir(DRAFTS_DIR, { withFileTypes: true });
  const draftFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(DRAFTS_DIR, e.name));

  const drafts: FlowSummary[] = [];
  for (const filePath of draftFiles) {
    const parsed = FlowSchema.safeParse(await readJsonFile(filePath));
    if (!parsed.success) continue;
    const { id, name, description, version, updatedAt } = parsed.data;
    drafts.push({ id, name, description, version, updatedAt });
  }

  drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return drafts;
}

export async function readDraft(flowId: string): Promise<Flow> {
  await ensureDirs();
  const parsed = FlowSchema.parse(await readJsonFile(draftPath(flowId)));
  return parsed;
}

export async function writeDraft(flow: Flow): Promise<Flow> {
  await ensureDirs();
  const normalized: Flow = {
    ...flow,
    updatedAt: new Date().toISOString(),
  };
  const parsed = FlowSchema.parse(normalized);
  await writeJsonFile(draftPath(parsed.id), parsed);
  return parsed;
}

export async function publishDraft(flowId: string): Promise<Flow> {
  await ensureDirs();
  const draft = await readDraft(flowId);
  const next: Flow = {
    ...draft,
    version: draft.version + 1,
    updatedAt: new Date().toISOString(),
  };

  const parsed = FlowSchema.parse(next);

  // Save immutable published copy, then bump draft version too.
  await writeJsonFile(publishedPath(parsed.id, parsed.version), parsed);
  await writeJsonFile(draftPath(parsed.id), parsed);
  return parsed;
}

