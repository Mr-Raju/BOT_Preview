# CCaaS Contact Center Dashboard — Data Dictionary

Reference: `ccaas-contact-center-dashboard.html`  
Use this to align labels, wire APIs, and change definitions consistently.

**Legend**

| Column | Meaning |
|--------|---------|
| **Widget / attribute** | Name shown in UI or code identifier |
| **Type** | UI control, KPI card, chart, table column, etc. |
| **Description** | What it represents |
| **Formula / definition** | How to compute or source it (industry-standard where applicable) |
| **Why it’s shown** | Operational or analytic purpose |

---

## 1. Shell — navigation, brand, and filters

| Widget / attribute | Type | Description | Formula / definition | Why it’s shown |
|-------------------|------|-------------|----------------------|----------------|
| Nextiva NCC / AI Dashboard / Contact Center Analytics | Brand block | Product framing; not a metric | Static copy | Orientation and product context |
| Executive | Nav item | Executive summary view (active in demo) | Route / view id (not wired) | Entry point for leadership KPIs |
| Voice queues | Nav item | Queue-centric analytics | Route / view id | Drill-down to queue SL, ASA, staffing |
| IVR & self‑serve | Nav item | IVR containment, deflection, abandon | Route / view id | Isolate automation vs agent demand |
| Agent performance | Nav item | Per-agent or team productivity | Route / view id | Coaching and capacity planning |
| CSAT & QA | Nav item | Quality and satisfaction | Route / view id | Outcome quality beyond efficiency |
| Realtime wallboard | Nav item | Live operational snapshot | Route / view id | Intraday reaction to spikes |
| Contact center operations | Page title | Main content heading | Static | Describes the working view |
| Clock (`#clock`) | Live text | Current local date/time | `new Date()` formatted each second | Audit “as of” for screenshots and ops |
| Range (`#range`: Today / Last 7 days / Last 30 days) | Filter | Reporting window | Apply as `WHERE event_ts` in `[start, end]` | Trends vs intraday; all comparisons should use same window |
| Queue (`#queue`: All / Sales / Support / Billing) | Filter | Subset of queues/skills | Filter fact tables by `queue_id` or skill | Focused triage without rebuilding the page |
| Refresh (`#refresh`) | Button | Re-randomizes a subset of KPIs and rebuilds charts | Demo: `jitterMetrics()` + `buildCharts()` | In production: refetch aggregates from API/cache |

**Demo caveat:** Changing Range/Queue only runs `jitterMetrics()` on four count KPIs; charts and most KPI text do not re-query by filter until you implement backend logic.

---

## 2. KPI grid — cards (`data-metric` = implementation hook)

| Label | `data-metric` | Type | Description | Formula / definition | Why it’s shown |
|-------|---------------|------|-------------|------------------------|----------------|
| Calls offered | `offered` | KPI count | Inbound attempts presented to routing (IVR or queue), per your platform’s definition | Typically: `COUNT(*)` where `call_direction = inbound` AND `presented_to_platform = true` in period; **exclude** pure test trunks if applicable | Top-of-funnel volume for capacity and forecasting |
| Calls handled | `handled` | KPI count | Calls completed with a handled disposition (answered + wrapped per policy) | Often: `COUNT(*)` where `final_disposition IN ('answered','handled')` per CCaaS; align with your AHT denominator | Throughput and staffing adequacy |
| Missed calls | `missed` | KPI count | Offered but not answered within policy (e.g. ring-no-answer, agent timeout) | Platform-specific; commonly: `offered_to_agent AND NOT answered` OR `abandon_before_threshold` excluded from “abandon”; **define** vs busy/reject | Exposure of answerability gaps |
| Voicemails | `vm` | KPI count | Calls leaving voicemail / async capture | `COUNT(*)` where `disposition = voicemail` (or VM box deposit) | Callback workload and customer preference signal |
| IVR contained | `ivr` | KPI % | Callers who self-serve in IVR without queueing to an agent | `100 × (IVR_contained_calls / IVR_presented_calls)`; **define** “contained” (task complete in IVR) | Self-service effectiveness; lowers agent load |
| IVR abandon | `ivrAbandon` | KPI % | Caller disconnects while still in IVR (before agent) | `100 × (IVR_abandon_calls / IVR_presented_calls)` | Friction in tree, long prompts, or misrouted intents |
| Queue abandoned | `abandon` | KPI count | Caller disconnects while waiting for an agent (post-IVR) | `COUNT(*)` where `disposition = abandoned_in_queue` AND `wait_start` before disconnect | Direct pain point for staffing and SL |
| Abandon rate | `abandonRate` | KPI % | Share of queue-eligible calls that abandon | `100 × (queue_abandons / (calls_entered_queue))` or `100 × abandons / (answered + abandons)` — **pick one** and document | Normalizes abandon vs volume; compare across intervals |
| Service level (20s) | `sl` | KPI % | % of calls answered within threshold | Industry: `100 × (calls_answered_within_20s / calls_offered_to_queue)`; threshold (20s) must match contractual SLA | Classic SLA reporting for clients and WFM |
| ASA | `asa` | KPI duration | Mean wait in queue before answer | `SUM(queue_wait_seconds_answered) / COUNT(answered_calls)` (often excludes abandons); some use median (ASA vs “median wait”) | Speed-of-answer health; pairs with SL |
| AHT | `aht` | KPI duration | Average handle time per handled interaction | `SUM(talk + hold + ACW) / COUNT(handled_calls)` for interval; ACW inclusion is policy | Efficiency and scheduling (Erlang) |
| FCR | `fcr` | KPI % | Issues resolved on first contact (no repeat within window) | `100 × (contacts_with_no_repeat_within_N_days / eligible_contacts)`; **N** and channel rules must be fixed | Quality and cost avoidance |
| Occupancy | `occ` | KPI % | Time agents are busy vs available | `100 × (productive_time / (productive_time + available_time))` per schedule; exclude approved offline | Utilization without burning out agents |
| Adherence | `adh` | KPI % | Conformance to schedule | `100 × (minutes_in_schedule_states / scheduled_minutes)`; breaks/lunch per WFM rules | Schedule discipline for SL attainment |
| Callback kept | `cb` | KPI % | Scheduled callbacks completed vs offered | `100 × (callbacks_connected_or_resolved / callbacks_scheduled)` | Promise reliability; reduces repeat abandons |
| CSAT | `csat` | KPI score | Customer satisfaction (survey) | `AVG(survey_score)` on agreed scale (here 1–5) | Outcome metric beyond operational KPIs |
| KPI delta line (e.g. “▲ 4.2% vs prior period”) | Subtext | Trend vs prior window | `(current − prior) / prior × 100` for rates/counts; or ppt change for % points | Quick directionality; must use same formula as headline |

**Demo caveat:** Only `offered`, `handled`, `missed`, and `vm` are numerically jittered on Refresh/Range/Queue. Other KPI values and all deltas are static placeholder text until connected to data.

---

## 3. Chart widgets

### 3.1 Call outcome mix (`#chartOutcomes`)

| Attribute | Type | Description | Formula / definition | Why it’s shown |
|-----------|------|-------------|------------------------|----------------|
| Widget | Doughnut chart | Distribution of major disposition buckets | Each slice = category count; **not** necessarily mutually exclusive in real data (define deduping) | One-glance balance of success vs leakage |
| Handled | Series segment | Same as KPI “Calls handled” bucket | Count of handled | Green / success mix |
| Missed | Series segment | Same as “Missed calls” | Count | Answer gap |
| Voicemail | Series segment | Same as “Voicemails” | Count | Async workload |
| IVR contained | Series segment | Calls resolved in IVR | Count (subset of IVR presented) | Automation value |
| Queue abandon | Series segment | Abandoned waiting for agent | Count | Queue pain |
| IVR abandon | Series segment | Abandoned in IVR | Count | IVR UX / routing |

**Demo data:** `[11204, 412, 189, 3200, 623, 180]` — illustrative; totals need not equal “offered” unless you enforce a single partition of calls.

---

### 3.2 Hourly contact volume (`#chartVolume`)

| Attribute | Type | Description | Formula / definition | Why it’s shown |
|-----------|------|-------------|------------------------|----------------|
| X-axis | Time bucket | e.g. 8:00–19:00 hourly | `GROUP BY hour(local_ts)` | Intraday staffing alignment |
| Offered | Line series | Calls offered per hour | `COUNT(offered)` per hour | Demand curve |
| Answered | Line series | Calls answered per hour | `COUNT(answered)` per hour | Served demand vs offered |

**Demo data:** 12 hours of hard-coded arrays; replace with query grouped by hour for selected Range.

---

### 3.3 IVR funnel (`#chartIvr`)

| Attribute | Type | Description | Formula / definition | Why it’s shown |
|-----------|------|-------------|------------------------|----------------|
| Presented | Bar | Calls that hit IVR | `COUNT(IVR_session_start)` | Funnel top |
| Contained | Bar | Self-serve completion | `COUNT(contained_disposition)` | Deflection |
| To agent | Bar | Transferred/queued to agent | `COUNT(IVR_exit_to_queue)` | Agent demand from IVR |
| IVR abandon | Bar | Disconnect in IVR | `COUNT(abandon_in_IVR)` | Drop-off |
| Error / zero-out | Bar | Failures or explicit operator request | `COUNT(error OR zero_out)` | Tree health / containment leaks |

**Demo data:** `[12847, 8787, 2850, 655, 180]` — funnel stages in real systems may overlap events per session; define **session-level** vs **event-level** counting.

---

### 3.4 Queue health (`#chartQueues`)

| Attribute | Type | Description | Formula / definition | Why it’s shown |
|-----------|------|-------------|------------------------|----------------|
| Categories | X-axis | Queue names (Sales, Support, Billing, VIP) | One bar group per `queue_id` | Compare peer queues |
| ASA (sec) | Bar (left Y) | Average speed of answer for that queue | Same ASA formula, filtered by queue | Wait experience by line of business |
| Abandon % | Bar (right Y) | Abandon rate for that queue | `100 × abandons / (answered + abandons)` or your standard, per queue | Pain correlation with ASA |

**Demo data:** ASA `[38, 65, 22, 18]` seconds; Abandon `%` `[4.2, 7.1, 3.0, 1.2]`. Panel subtitle mentions SL by queue; **SL is not a series in this chart** — add a third metric or separate widget if needed.

---

## 4. Live queue snapshot — table columns

| Column | Type | Description | Formula / definition | Why it’s shown |
|--------|------|-------------|------------------------|----------------|
| Queue | Text | Queue or virtual queue name | Dimension `queue.name` | Identity |
| Waiting | Number or “—” | Current calls in queue | Real-time: `COUNT(calls WHERE state = waiting)` | Immediate backlog |
| Longest wait | Duration or text | Age of oldest waiting call | `MAX(now - entered_queue_ts)` for waiting; or SLA text for callback | Worst-case customer wait |
| Agents avail | Number or “—” | Agents ready for next call | Real-time: `COUNT(agents WHERE state = available)` | Immediate capacity |
| ASA (rolling) | Duration or “—” | Rolling average wait for recent answered | Rolling window mean over last *N* minutes or *M* calls | Short-term trend on wallboard |
| Abandon % | Percent | Rolling or interval abandon rate | Same abandon % formula on rolling window | Risk if climbing |
| Type | Tag (VOICE / IVR / QUEUE) | Channel or object kind | Categorical: voice queue vs IVR aggregate vs callback/virtual | Filters mental model; drives drill-down |

**Demo data:** Hard-coded `queueRows` in script; not live.

---

## 5. Cross-metric consistency checklist (when you change definitions)

| Topic | Recommendation |
|-------|----------------|
| Denominator for SL / abandon | Use one canonical “calls offered to queue” definition and reuse everywhere. |
| IVR vs queue | Split timestamps: events before `queue_enter` vs after, for IVR abandon vs queue abandon. |
| Handled vs answered | If wrap is included, state whether AHT and “handled” require `ACW complete`. |
| Duplicate sessions | Define if abandoned then recalled counts as one or two “offered” for rates. |

---

## 6. Quick index — `data-metric` → KPI label

| `data-metric` | KPI label |
|---------------|-----------|
| `offered` | Calls offered |
| `handled` | Calls handled |
| `missed` | Missed calls |
| `vm` | Voicemails |
| `ivr` | IVR contained |
| `ivrAbandon` | IVR abandon |
| `abandon` | Queue abandoned |
| `abandonRate` | Abandon rate |
| `sl` | Service level (20s) |
| `asa` | ASA |
| `aht` | AHT |
| `fcr` | FCR |
| `occ` | Occupancy |
| `adh` | Adherence |
| `cb` | Callback kept |
| `csat` | CSAT |

---

*Document version: matches dashboard HTML structure as of creation; update this file when you add/remove widgets or change formulas.*
