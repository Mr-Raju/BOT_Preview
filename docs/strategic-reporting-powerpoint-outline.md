# PowerPoint outline — Strategic Reporting (copy each block to one slide)

*Source of truth for diagrams/RCA/FBA/actions: `strategic-reporting-complete-guide.md`*

---

## Slide 1 — Title

**Strategic reporting & analytics**  
Nextiva vs. market · Canned · Builder · API / warehouse / BI  
March 2026

---

## Slide 2 — Executive thesis

- Reporting = **three legs**: canned · builder · API/warehouse  
- One **metrics layer** everywhere (trust)  
- MultiCaaS → **unified EX + CX** story

---

## Slide 3 — Strategy pillars

1. Trustworthy metrics (UI = export = API)  
2. Progressive disclosure (canned → customize → warehouse)  
3. Enterprise egress first-class  
4. Don’t rebuild Tableau — integrate

---

## Slide 4 — Target architecture (paste diagram)

*Insert PNG from Mermaid: “4.1 High-level logical architecture” in complete guide*

---

## Slide 5 — Data to customer BI (paste diagram)

*Insert PNG from Mermaid: “4.2 Data flow — interaction to BI”*

---

## Slide 6 — Supervisor flow (paste diagram)

*Insert PNG from Mermaid: “5.1 Supervisor — daily operations”*

---

## Slide 7 — Analyst builder flow (paste diagram)

*Insert PNG from Mermaid: “5.2 Analyst — custom report”*

---

## Slide 8 — Data engineer / warehouse flow (paste diagram)

*Insert PNG from Mermaid: “5.3 Data engineer — warehouse pipeline”*

---

## Slide 9 — RCA summary

**Symptoms:** RFP friction · services-heavy custom · AI narrative gap · egress limits  
**Root causes:** Semantic immaturity · persona gaps · AI not canned · egress secondary · EX/CX silo  
**Actions:** Metric catalog · builder MVP · AI packs · retention + connector · unified templates

---

## Slide 10 — FBA (canned)

| Feature | Benefit | Attribute |
|---------|---------|-----------|
| Larger library | Faster TTV | # reports, 30d activation |
| AI packs | Faster insight | pack adoption |
| EX+CX templates | MultiCaaS fit | cross-domain usage |

---

## Slide 11 — FBA (builder + egress)

| Feature | Benefit | Attribute |
|---------|---------|-----------|
| Templates + catalog | Less PS | % from template |
| Warehouse connector | IT standard | # enterprises live |
| Long retention | Audit | max days offered |

---

## Slide 12 — Phased roadmap

- **P1** Foundation: canned + retention + glossary  
- **P2** Parity: warehouse MVP + AI canned + API  
- **P3** Differentiation: visual builder + metric scale + unified IA  
- **P4** Platform: streaming + more connectors + predictive

---

## Slide 13 — Action items (top 5)

1. Metrics catalog v0 + owners  
2. Win/loss: reporting objections  
3. Canned gap list vs competitors  
4. Retention policy (target 90d+)  
5. Warehouse connector PRD (e.g. Snowflake)

---

## Slide 14 — Competitive snapshot

- **RingCentral:** breadth (reports/metrics)  
- **Dialpad:** operational AI  
- **Nextiva:** solid core → invest in AI canned, builder, connectors, retention

---

## Slide 15 — Next steps / ask

- Assign owners to action table (complete guide §10)  
- Pick **one** flagship warehouse target for MVP  
- Align SE narrative with metrics glossary + demo script

---

*End of outline*

Summary

# Case Study (one page) — Bank of Baroda: BOB Survey Module with Video Chat

**Platform:** Simplify360 · **Touchpoint:** BOB web chat + SMS · **Ref:** S360-BOB Survey module (PDF `270326-071203`), dev `https://dev.simplify360.com/BOB.jsp`

**Summary** — BOB extended Simplify360 live chat with a **post-interaction survey** delivered by **SMS** after agents close tickets, including paths for **scheduled video**, **video now**, and **chat without video**. Responses land in a **Survey Dashboard**. **One response per survey link** preserves data quality. Correct **ticket state** (notably **“Waiting for customer”** when the customer has not joined) **gates SMS** so surveys do not fire in the wrong situations.

| | |
|--|--|
| **Challenge** | Measure satisfaction after video and chat; time SMS correctly; report in one place; one stack for video / non-video journeys. |
| **Solution** | Widget + ticketing workflow + SMS (meeting link for scheduled calls, survey link after closure) + survey UI + dashboard. |
| **Flow (scheduled video)** | Customer books slot → **SMS meeting link** → agent pulls ticket, updates properties (**“Waiting for customer”** when appropriate) → after call, agent **closes ticket** → **survey SMS** → customer submits → **Survey Dashboard**. |
| **Also in scope** | Chat **without** video; **Video call now** — same configurable stack, scenario-specific testing. |
| **Tech (high level)** | `Simplify360Chat.js` + stylesheet; **JSON** `getAppConfiguration()` for hosts, `configId`, copy, BOB styling, forms (e.g. phone/name), behavior flags; Test App + HTML fixtures for QA. |
| **Value** | Structured CX feedback; **fewer mistaken survey SMS** via state rules; **non-repeatable** links; consistent brand; reusable config. |
| **Follow-ups** | **SMS as a dashboard source** for filtering/reporting; protect tokens and env URLs in production. |

*Stakeholder narrative only — not a full spec or security sign-off.*

---

## Summary one-pager (end of doc)

**Bank of Baroda × Simplify360 — post-chat/video survey via SMS**

- **What:** After live chat or video (scheduled, instant, or non-video paths), customers get an **SMS survey link** when the agent **closes the ticket**; answers show in a **Survey Dashboard**. Each link is **single-use**.
- **Why it matters:** Banks need **measurable CX** after high-touch digital service without **spamming** customers who never joined a scheduled call.
- **How it works:** **Ticket state** (e.g. **“Waiting for customer”**) controls when SMS fires; **JSON-configured** web widget (`Simplify360Chat.js`) keeps **BOB branding** and forms consistent across scenarios.
- **Proof of value:** One platform for **video + chat**; **gated SMS** reduces wrong-time surveys; **dashboard** centralizes feedback; roadmap item: tag **SMS as a source** for reporting.

**One-line pitch:** *BOB closes the loop on digital support—video or chat—with timely, rule-based SMS surveys and a single dashboard for CX insight.*
