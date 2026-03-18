"use client";

import { useEffect, useMemo, useState } from "react";
import type { Flow, FlowNode, FlowSummary } from "@/lib/flowSchema";

type SaveState = "idle" | "saving" | "saved" | "error";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function getNodeById(flow: Flow | null, nodeId: string | null): FlowNode | null {
  if (!flow || !nodeId) return null;
  return flow.nodes.find((n) => n.id === nodeId) ?? null;
}

function buildPreviewPath(flow: Flow | null, maxSteps = 50): FlowNode[] {
  if (!flow) return [];
  const visited = new Set<string>();
  const out: FlowNode[] = [];
  let cur: string | undefined = flow.startNodeId;

  for (let i = 0; i < maxSteps && cur; i++) {
    if (visited.has(cur)) break;
    visited.add(cur);
    const node = flow.nodes.find((n) => n.id === cur);
    if (!node) break;
    out.push(node);

    // In preview we auto-follow nextNodeId; buttons are still clickable in UI.
    cur = node.nextNodeId;
  }
  return out;
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

async function apiPost<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}

export default function StudioClient({
  initialFlows,
  initialFlowId,
}: {
  initialFlows: FlowSummary[];
  initialFlowId: string | null;
}) {
  const [flows, setFlows] = useState<FlowSummary[]>(initialFlows);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(
    initialFlowId,
  );
  const [flow, setFlow] = useState<Flow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [publishState, setPublishState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => getNodeById(flow, selectedNodeId),
    [flow, selectedNodeId],
  );

  const previewNodes = useMemo(() => buildPreviewPath(flow), [flow]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedFlowId) {
        setFlow(null);
        setSelectedNodeId(null);
        return;
      }
      setError(null);
      try {
        const data = await apiGet<{ flow: Flow }>(`/api/flows/${selectedFlowId}`);
        if (cancelled) return;
        setFlow(data.flow);
        setSelectedNodeId(data.flow.startNodeId);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load flow");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedFlowId]);

  async function refreshFlowList() {
    const data = await apiGet<{ flows: FlowSummary[] }>("/api/flows");
    setFlows(data.flows);
  }

  function updateNode(patch: Partial<FlowNode>) {
    if (!flow || !selectedNode) return;
    const nextNodes = flow.nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, ...patch } : n,
    );
    setFlow({ ...flow, nodes: nextNodes });
    setSaveState("idle");
  }

  function updateFlowMeta(patch: Partial<Pick<Flow, "name" | "description" | "startNodeId">>) {
    if (!flow) return;
    setFlow({ ...flow, ...patch });
    setSaveState("idle");
  }

  async function saveDraft() {
    if (!flow) return;
    setSaveState("saving");
    setError(null);
    try {
      const data = await apiPut<{ flow: Flow }>(`/api/flows/${flow.id}`, flow);
      setFlow(data.flow);
      setSaveState("saved");
      await refreshFlowList();
    } catch (e) {
      setSaveState("error");
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function publish() {
    if (!flow) return;
    setPublishState("saving");
    setError(null);
    try {
      const data = await apiPost<{ flow: Flow }>(`/api/flows/${flow.id}/publish`);
      setFlow(data.flow);
      setPublishState("saved");
      await refreshFlowList();
    } catch (e) {
      setPublishState("error");
      setError(e instanceof Error ? e.message : "Publish failed");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(230,0,18,0.20),transparent_45%),radial-gradient(900px_circle_at_85%_30%,rgba(255,255,255,0.12),transparent_45%),linear-gradient(180deg,#09090b,rgba(9,9,11,0.92))] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-100">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#E60012] text-xs font-black text-white">
                S
              </span>
              Bot Flow Studio
            </div>
            <div className="text-xs text-zinc-400">
              Edit flows, preview the widget, then publish a version.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveDraft}
              disabled={!flow || saveState === "saving"}
              className={classNames(
                "rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ring-white/10",
                !flow || saveState === "saving"
                  ? "bg-white/10 text-white/50"
                  : "bg-white text-zinc-950 hover:bg-zinc-100",
              )}
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save draft"}
            </button>
            <button
              onClick={publish}
              disabled={!flow || publishState === "saving"}
              className={classNames(
                "rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-white/10",
                !flow || publishState === "saving"
                  ? "bg-[#E60012]/25 text-white/60"
                  : "bg-[#E60012] text-white hover:bg-[#c80010]",
              )}
            >
              {publishState === "saving"
                ? "Publishing…"
                : publishState === "saved"
                  ? "Published"
                  : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-4">
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-3 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Flows
            </div>
            <div className="space-y-1">
              {flows.length === 0 ? (
                <div className="text-sm text-zinc-400">No flows found.</div>
              ) : (
                flows.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFlowId(f.id)}
                    className={classNames(
                      "w-full rounded-lg px-2.5 py-2 text-left ring-1 ring-inset ring-white/10",
                      f.id === selectedFlowId
                        ? "bg-white/10"
                        : "bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <div className="truncate text-sm font-medium text-zinc-100">
                      {f.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="truncate">{f.id}</span>
                      <span>v{f.version}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-5">
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="border-b border-white/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Editor</div>
                  <div className="text-xs text-zinc-400">
                    {flow ? (
                      <>
                        Draft <span className="font-mono">{flow.id}</span> • v{flow.version} •{" "}
                        <span className="font-mono">{flow.updatedAt}</span>
                      </>
                    ) : (
                      "Select a flow"
                    )}
                  </div>
                </div>
              </div>
              {error ? (
                <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
            </div>

            {flow ? (
              <div className="p-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs font-semibold text-zinc-400">
                      Flow name
                      <input
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                        value={flow.name}
                        onChange={(e) => updateFlowMeta({ name: e.target.value })}
                      />
                    </label>
                    <label className="text-xs font-semibold text-zinc-400">
                      Description
                      <input
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                        value={flow.description ?? ""}
                        onChange={(e) =>
                          updateFlowMeta({ description: e.target.value || undefined })
                        }
                      />
                    </label>
                    <label className="text-xs font-semibold text-zinc-400">
                      Start node id
                      <input
                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                        value={flow.startNodeId}
                        onChange={(e) => updateFlowMeta({ startNodeId: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-2">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Nodes
                    </div>
                    <div className="max-h-56 space-y-1 overflow-auto pr-1">
                      {flow.nodes.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setSelectedNodeId(n.id)}
                          className={classNames(
                            "w-full rounded-lg px-2.5 py-2 text-left ring-1 ring-inset ring-white/10",
                            n.id === selectedNodeId
                              ? "bg-white/10"
                              : "bg-white/5 hover:bg-white/10",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 truncate text-sm font-medium">
                              {n.id}
                            </div>
                            <div className="text-xs text-zinc-400">{n.type}</div>
                          </div>
                          {n.text ? (
                            <div className="truncate text-xs text-zinc-400">
                              {n.text}
                            </div>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedNode ? (
                    <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">
                          Node <span className="font-mono">{selectedNode.id}</span>
                        </div>
                        <div className="text-xs text-zinc-400">{selectedNode.type}</div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <label className="text-xs font-semibold text-zinc-400">
                          Text
                          <textarea
                            rows={3}
                            className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                            value={selectedNode.text ?? ""}
                            onChange={(e) =>
                              updateNode({ text: e.target.value || undefined })
                            }
                            placeholder="Message shown to the user…"
                          />
                        </label>

                        <label className="text-xs font-semibold text-zinc-400">
                          Image URL (optional)
                          <input
                            className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                            value={selectedNode.imageUrl ?? ""}
                            onChange={(e) =>
                              updateNode({ imageUrl: e.target.value || undefined })
                            }
                            placeholder="https://…"
                          />
                        </label>

                        <label className="text-xs font-semibold text-zinc-400">
                          Next node id (optional)
                          <input
                            className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                            value={selectedNode.nextNodeId ?? ""}
                            onChange={(e) =>
                              updateNode({ nextNodeId: e.target.value || undefined })
                            }
                            placeholder="n_next"
                          />
                        </label>

                        {selectedNode.type === "buttons" ? (
                          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-2">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              Buttons
                            </div>
                            <div className="space-y-2">
                              {(selectedNode.buttons ?? []).map((b, idx) => (
                                <div
                                  key={b.id}
                                  className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-zinc-950/40 p-2"
                                >
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <label className="text-xs font-semibold text-zinc-400">
                                      Label
                                      <input
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                                        value={b.label}
                                        onChange={(e) => {
                                          const next = [...(selectedNode.buttons ?? [])];
                                          next[idx] = { ...next[idx], label: e.target.value };
                                          updateNode({ buttons: next });
                                        }}
                                      />
                                    </label>
                                    <label className="text-xs font-semibold text-zinc-400">
                                      Next node id
                                      <input
                                        className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                                        value={b.nextNodeId ?? ""}
                                        onChange={(e) => {
                                          const next = [...(selectedNode.buttons ?? [])];
                                          next[idx] = {
                                            ...next[idx],
                                            nextNodeId: e.target.value || undefined,
                                          };
                                          updateNode({ buttons: next });
                                        }}
                                      />
                                    </label>
                                  </div>
                                  <label className="text-xs font-semibold text-zinc-400">
                                    Href (optional)
                                    <input
                                      className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#E60012]/60 focus:ring-2 focus:ring-[#E60012]/20"
                                      value={b.href ?? ""}
                                      onChange={(e) => {
                                        const next = [...(selectedNode.buttons ?? [])];
                                        next[idx] = {
                                          ...next[idx],
                                          href: e.target.value || undefined,
                                        };
                                        updateNode({ buttons: next });
                                      }}
                                    />
                                  </label>
                                </div>
                              ))}
                              <button
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                                onClick={() => {
                                  const next = [
                                    ...(selectedNode.buttons ?? []),
                                    { id: `b_${Date.now()}`, label: "New button" },
                                  ];
                                  updateNode({ buttons: next });
                                }}
                              >
                                Add button
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-zinc-400">
                Select a flow on the left to start editing.
              </div>
            )}
          </div>
        </section>

        <section className="col-span-12 md:col-span-4">
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
            <div className="border-b border-white/10 p-3">
              <div className="text-sm font-semibold">Widget preview</div>
              <div className="text-xs text-zinc-400">
                Styled like a website chat widget. Buttons are clickable.
              </div>
            </div>

            <ChatPreview
              key={`${flow?.id ?? "none"}-${flow?.updatedAt ?? "na"}`}
              flow={flow}
              previewNodes={previewNodes}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ChatPreview({
  flow,
  previewNodes,
}: {
  flow: Flow | null;
  previewNodes: FlowNode[];
}) {
  const [path, setPath] = useState<FlowNode[]>(() => previewNodes);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(() => {
    return previewNodes.at(-1)?.id ?? flow?.startNodeId ?? null;
  });

  const currentNode = useMemo(
    () => getNodeById(flow, currentNodeId),
    [flow, currentNodeId],
  );

  function jumpTo(nodeId: string | undefined) {
    if (!flow || !nodeId) return;
    const node = getNodeById(flow, nodeId);
    if (!node) return;
    setCurrentNodeId(nodeId);
    setPath((prev) => [...prev, node]);
  }

  return (
    <div className="p-3">
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between bg-[#E60012] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-black ring-1 ring-inset ring-white/25">
              S
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Suzuki Assistant</div>
              <div className="text-[11px] text-white/80">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="h-2 w-2 rounded-full bg-white/50" />
            <span className="h-2 w-2 rounded-full bg-white/35" />
          </div>
        </div>

        <div className="bg-[radial-gradient(700px_circle_at_20%_0%,rgba(230,0,18,0.08),transparent_45%),linear-gradient(180deg,#ffffff,#fafafa)]">
          <div className="h-[520px] overflow-auto px-4 py-4">
            <div className="space-y-3">
              {path.map((n) => (
                <div key={`${n.id}-${n.type}`} className="space-y-2">
                  {n.type !== "image" ? (
                    n.text ? (
                      <div className="flex items-end gap-2">
                        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-700 ring-1 ring-inset ring-zinc-200 sm:inline-flex">
                          S
                        </div>
                        <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200">
                          {n.text}
                        </div>
                      </div>
                    ) : null
                  ) : null}

                  {n.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.imageUrl}
                      alt=""
                      className="max-w-[90%] rounded-2xl ring-1 ring-inset ring-zinc-200"
                    />
                  ) : null}
                </div>
              ))}

              {currentNode?.type === "buttons" &&
              (currentNode.buttons?.length ?? 0) > 0 ? (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {currentNode.buttons!.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          if (b.href)
                            window.open(b.href, "_blank", "noopener,noreferrer");
                          if (b.nextNodeId) jumpTo(b.nextNodeId);
                        }}
                        className="rounded-full border border-[#E60012]/25 bg-white px-3 py-2 text-sm font-medium text-[#b4000e] shadow-sm hover:border-[#E60012]/50 hover:bg-[#E60012]/5"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Preview only • edits won’t affect production until you publish.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

