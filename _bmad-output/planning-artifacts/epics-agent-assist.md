---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
inputDocuments:
  - _bmad-output/planning-artifacts/prd-agent-assist.md
---

# Agent Assist Phase 1 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Agent Assist Phase 1, decomposing the requirements from the PRD and Architecture into implementable stories suitable for Jira.

## Requirements Inventory

### Functional Requirements

FR1: The system must provide contextual search capabilities for solutions within the Unibox editor.
FR2: Search results must be strictly limited to a verified Knowledge Base (KB).
FR3: The system must provide "Rephrase" text manipulation for better tone or alternative wording.
FR4: The system must provide "Shorten" text manipulation.
FR5: The system must provide "Make it Larger (Expand)" text manipulation.
FR6: The system must provide "Translate" text manipulation into the customer's desired language.
FR7: The system must provide "Summarize" capabilities for long customer queries or historical chat transcripts.
FR8: The system must provide a "Suggest Response" capability based on the ongoing conversation context.
FR9: The system must explicit return "Out of Scope" (OOS) for queries falling outside the KB.

### NonFunctional Requirements

NFR1: Minimal UI updates (accessible via simple sidebar, icon, or contextual menu) to avoid redesigning Unibox Editor page.
NFR2: The system shall not hallucinate answers using public datasets outside the approved KB.
NFR3: Human-in-the-loop is mandatory; no automated sending of messages.
NFR4: Integration must use REST/gRPC connecting to an AI API Gateway.
NFR5: Must enforce Auth & Rate limiting via the API Gateway.
NFR6: LLM Provider access must be secure and fulfill regional compliance.
NFR7: KB Search Indexing system must be updated via automated ETL pipelines.

### Additional Requirements

- Frontend requires UI component library matching Unibox styling.
- Backend requires dedicated AI API Gateway for routing, prompt formatting, and logging.
- Authentication system must verify active Agent session (e.g., OAuth2, JWT).

### FR Coverage Map

FR1: Epic 1 - Establish core interaction point and retrieval logic.
FR2: Epic 1 - Restrict backend query strictly to the verified indices.
FR9: Epic 1 - Provide safe fallbacks when questions are out of the KB.
FR3: Epic 2 - Tone editing manipulation capabilities.
FR4: Epic 2 - Length condensing capabilities.
FR5: Epic 2 - Context expansion capabilities.
FR6: Epic 2 - Output translation capabilities.
FR7: Epic 2 - Long-text summarization tools.
FR8: Epic 2 - Proactive response suggestion generation.

## Epic List

### Epic 1: Assistant Foundation & Secure Retrieval
*Provides agents with immediate, verified answers to customer questions from within their text editor.*
**FRs covered:** FR1, FR2, FR9

### Epic 2: Intelligent Text Manipulation & Suggestions
*Empowers agents to immediately improve, adapt, and generate the perfect response length and tone during customer interactions.*
**FRs covered:** FR3, FR4, FR5, FR6, FR7, FR8

---

## Epic 1: Assistant Foundation & Secure Retrieval

Provides agents with immediate, verified answers to customer questions from within their text editor.

### Story 1.1: Core API Gateway & Authentication Pipeline

As a System Admin,
I want an API Gateway with Agent authentication,
So that only authorized Unibox agents can access the secure AI services.

**Acceptance Criteria:**

**Given** an incoming request from the Unibox frontend plugin
**When** the request hits the AI API Gateway
**Then** the Gateway must validate the active Agent session (e.g. OAuth2/JWT)
**And** reject the request with a 401 Unauthorized if invalid.

### Story 1.2: RAG Pipeline & Vector DB Connection

As a Backend Engineer,
I want the LLM to query only our specific Vector Database (Knowledge Index),
So that AI answers are strictly sourced from verified company data without hallucinations.

**Acceptance Criteria:**

**Given** a validated user question
**When** the prompt orchestration service processes the query
**Then** it must execute a similarity search against the designated enterprise Vector DB
**And** append solely those retrieved documents into the LLM context limits as ground truth.

### Story 1.3: Safe "Out of Scope" (OOS) Handling

As a Support Agent,
I want the AI to explicitly tell me when it doesn't know the answer based on company data,
So that I don't accidentally send a hallucinated or incorrect response to a customer.

**Acceptance Criteria:**

**Given** a search query that yields no relevant results above the similarity threshold in the Vector DB
**When** the LLM attempts to generate an answer
**Then** the system must bypass standard generation
**And** explicitly return an "Out of Scope" or "I don't have this information" standardized message.

### Story 1.4: Unibox Editor Plugin Integration (Search UI)

As a Support Agent,
I want a simple sidebar or contextual menu in my Unibox Editor,
So that I can search the Knowledge Base and see AI responses without leaving my workspace.

**Acceptance Criteria:**

**Given** the Unibox Text Editor is open
**When** I click the new Agent Assist icon/trigger
**Then** a minimal UI component should appear to accept my search query
**And** display the verified answer securely returned by the API Gateway.

---

## Epic 2: Intelligent Text Manipulation & Suggestions

Empowers agents to immediately improve, adapt, and generate the perfect response length and tone during customer interactions.

### Story 2.1: Rephrase Selected Text

As a Support Agent,
I want to select text and click "Rephrase",
So that the AI can instantly provide a better-toned or alternative wording without changing my core message.

**Acceptance Criteria:**

**Given** I have highlighted text in the Unibox editor
**When** I select "Rephrase" from the Agent Assist plugin
**Then** the Middle Layer must generate a prompt instructing the LLM to rewrite the text with a professional tone
**And** the new text must be presented for me to insert or replace the existing text.

### Story 2.2: Shorten Selected Text

As a Support Agent,
I want to select long-winded text and click "Shorten",
So that I can quickly condense the message to be more direct and concise for the customer.

**Acceptance Criteria:**

**Given** I have highlighted text in the Unibox editor
**When** I select "Shorten" from the Agent Assist plugin
**Then** the AI must return a more concise version of the original text
**And** retain all critical factual information.

### Story 2.3: Expand (Make it Larger) from Shorthand

As a Support Agent,
I want to type brief notes and click "Expand",
So that the AI can elaborate my shorthand into a fully-formed, polite customer response.

**Acceptance Criteria:**

**Given** I have highlighted brief notes or bullet points
**When** I select "Make it Larger"
**Then** the AI must expand the context into a complete, professional paragraph
**And** I must review the expanded text before it enters the final editor view (Human-in-the-loop).

### Story 2.4: Translate Text to Customer Language

As a Support Agent,
I want to select my drafted response and click "Translate",
So that I can communicate accurately with customers who speak a different language.

**Acceptance Criteria:**

**Given** I have highlighted text
**When** I select "Translate" and choose a target language from the plugin UI
**Then** the LLM must translate the text accurately
**And** display the translated text for me to insert into the editor.

### Story 2.5: Summarize Long Customer Queries

As a Support Agent,
I want to select a long customer block of text or chat history and click "Summarize",
So that I can quickly grasp the core issue without reading the entire thread block word-for-word.

**Acceptance Criteria:**

**Given** I have highlighted a lengthy customer query or transcript
**When** I click "Summarize"
**Then** the plugin must display a short, bulleted summary of their key problems and questions
**And** this summary must NOT replace the text in the editor, but show in the plugin side-panel.

### Story 2.6: Suggest Response based on Context

As a Support Agent,
I want to click "Suggest Response",
So that the AI can auto-generate a contextual, verified reply to the customer's last message.

**Acceptance Criteria:**

**Given** an ongoing customer interaction in Unibox
**When** I click "Suggest Response"
**Then** the prompt orchestrator must pass the recent thread context and a KB similarity search to the LLM
**And** the LLM must generate a proposed response draft
**And** this draft must be surfaced in the plugin UI for me to explicitly approve or edit before sending.
