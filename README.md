# Contract Intake Agent

A NestJS service that reads an incoming contract, checks it against internal
knowledge, and then either **auto-approves** it or **flags it for human review** —
sending the matching Gmail message and recording the outcome on a Trello board.

The agent is an OpenAI function-calling loop: the model does the reading and the
judging, six tools do everything deterministic (vector search, email, Trello).

---

## How it decides

The system prompt ([`ContractAgent`](src/agents/contract-agent/contract.agent-def.ts))
forces the model to write out five explicit checks, each with `PASS`/`FAIL` and the
values it compared:

| # | Check | Question |
|---|---------------|--------------------------------------------------------|
| 1 | `FIELDS`      | counterparty, type, effective date, value, payment terms all present? |
| 2 | `COUNTERPARTY`| found via `search_known_clients`? |
| 3 | `POLICY`      | every term inside the limit `search_policies` states? |
| 4 | `SIGNED`      | signed by both parties? |
| 5 | `CONFIDENCE`  | was the document clear enough to read all of the above? |

The outcome is *counted*, not weighed:

```
ZERO FAILs          -> send_gmail_email   then create_approved_card
ONE OR MORE FAILs   -> create_gmail_draft then create_review_card
```

Design intent worth knowing:

- A check that could not be completed is a `FAIL`, never a `PASS`.
- Exactly one email per contract, never both tools.
- The Trello card comes **after** the email tool succeeds — never before, never alone.
- `send_gmail_email` goes out immediately and cannot be recalled; a draft is only
  waiting in Drafts, so the agent must never claim it was sent.
- A review card's reasons are the `FAIL` lines only. A passing check is never a
  reason — the tool descriptions repeat this because it is the failure mode the
  model falls into most.

## Architecture

```
POST /contract-agent  (message + optional PDF)
        │
        ├─ extractFileText ──── pdfjs → plain text, injected as a system message
        │
        ▼
BaseAgentService ──► OpenaiService.responseStreamMessage
                       │  streams deltas, buffers function_call args,
                       │  loops up to MAX_ROUNDS = 5 tool rounds
                       ▼
              agentDef.functions[name].processor(args, openSearchService)
                       │
        ┌──────────────┼───────────────┬──────────────────┐
        ▼              ▼               ▼                  ▼
 search_known_clients  search_policies  gmail tools       trello tools
 (OpenSearch kNN)      (OpenSearch kNN)  (Make webhook)   (Make webhook)
```

### Layers

| Path | Role |
|------|------|
| [`src/base-agent/`](src/base-agent) | Abstract controller + service: thread creation, streaming, file extraction, tool dispatch. Reusable by any agent. |
| [`src/contract/`](src/contract) | The concrete agent — `ContractAgentController`/`Service` just extend the base and mount at `/contract-agent`. |
| [`src/openai/`](src/openai/openai.service.ts) | Thin wrapper over the OpenAI **Responses + Conversations** API. Owns the stream loop and the tool-call round-trip. |
| [`src/agents/`](src/agents) | Agent definitions: system prompt, model, and the tool registry. |
| [`src/opensearch/`](src/opensearch) | Embedding + kNN retrieval, index mappings, ingest endpoints. |
| [`src/shared/util/`](src/shared/util) | PDF text extraction, email validation, required-field checks, date formatting. |

Adding an agent = one entry in [`agentsDefinitions`](src/agents/agentDefinitions.ts)
plus a controller extending `BaseAgentController`. Adding a tool = a `FunctionTool`
spec + a processor, wired in [`agentFunctions.ts`](src/agents/contract-agent/agentFunctions.ts).

## Tools

| Tool | Implementation | What it does |
|------|----------------|--------------|
| `search_known_clients` | [company](src/agents/contract-agent/functions/company) | kNN search over the `companies` index to confirm the counterparty is a known client/vendor. Optional `type` filter. |
| `search_policies` | [policy](src/agents/contract-agent/functions/policy) | kNN search over the `policies` index. Returns policy **text only** — the comparison is the model's job. |
| `create_gmail_draft` | [create-draft](src/agents/contract-agent/functions/email/create-draft) | Saves a draft for a human to send. Renders HTML incl. a Term / In contract / Policy limit table. |
| `send_gmail_email` | [send-email](src/agents/contract-agent/functions/email/send-email) | Sends the approval confirmation immediately. |
| `create_review_card` | [review-card](src/agents/contract-agent/functions/trello/review-card) | Card on **Needs Review**, listing every `FAIL` with real numbers. |
| `create_approved_card` | [approved-card](src/agents/contract-agent/functions/trello/approved-card) | Card on **Sent / Auto-Approved**, with the checks-passed audit trail. |

The model never writes markup. It supplies structured fields and the service
renders them — [`emailTemplate.util.ts`](src/agents/contract-agent/functions/email/emailTemplate.util.ts)
(HTML, escaped) and [`trelloCard.util.ts`](src/agents/contract-agent/functions/trello/trelloCard.util.ts)
(markdown, pipes/backticks neutralised). Gmail and Trello are both reached through
Make.com webhooks via [`WebHookClient`](src/agents/webhook-client/webHook.client.ts).

Every processor returns a JSON **string**, including its errors — a validation
failure (`checkProperty`, `checkEmail`) is fed back to the model as tool output so
it can correct itself rather than throwing.

## Retrieval

[`OpenSearchService`](src/opensearch/opensearch.service.ts) embeds text with
`text-embedding-3-small` (1536-dim) and searches HNSW/faiss `knn_vector` fields.

Because this OpenSearch version has no filtered kNN, the `term` filters are applied
*after* the kNN walk — so `k` (default `10`) is deliberately larger than the number
of rows actually wanted, or a filter can leave the result set empty.

Indices are declared in one place, [`mapping/index.ts`](src/opensearch/mapping/index.ts):
a mapping, a Zod schema, and the field echoed back after ingest. Both indices
require a `content` field — that is what gets embedded.

| Index | Schema |
|-------|--------|
| `companies` | [`CompanySchema`](src/agents/contract-agent/schema/company.schema.ts) — name, type, status, industry, risk level, notes |
| `policies`  | [`PolicySchema`](src/agents/contract-agent/schema/policy.schema.ts) — policy id, category, title, rule |

## API

### Agent

```http
POST /contract-agent/createThread
{ "name": "ContractAgent" }
```
Creates an OpenAI conversation seeded with the agent's system prompt. Returns the
conversation object — keep its `id` as `threadId`.

```http
POST /contract-agent
Content-Type: multipart/form-data

message=Please process the attached contract from marcus.feld@halberdlogistics.com
threadId=conv_...
agentName=ContractAgent        # optional, defaults to ContractAgent
file=@contract.pdf             # optional
```
Runs the agent and responds with the assembled assistant text. A PDF is parsed to
text and attached as a system message. Deltas and tool calls are surfaced through
[`StreamCallbacks`](src/openai/interface/callBacks.interface.ts) — currently logged
server-side; wire them to SSE/WS to stream to a client.

### Knowledge base

```http
POST /opensearch/index?index=companies          # create index if absent
POST /opensearch/document?index=policies        # body: array of documents
[{ "policy_id": "PAY-01", "category": "payment", "title": "Payment terms",
   "rule": "Net 30 maximum", "content": "Payment terms must not exceed Net 30 days." }]
```
The `index` query param selects the Zod schema documents are validated against.

## Setup

```bash
npm install
cp .env.example .env      # then fill it in
npm run build
npm run start:dev         # http://localhost:3001
```

### Environment

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | yes | chat + embeddings |
| `OPENSEARCH_NODE` | yes | e.g. `https://user:pass@host:9200` (TLS verification is disabled in the client) |
| `WEBHOOK_APY_KEY` | yes, for Gmail/Trello | sent as `x-make-apikey` to the Make webhooks |
| `OPENAI_EMBEDDINGS_MODEL` | no | defaults to `text-embedding-3-small` |
| `PORT` | no | defaults to `3001` |


### Scripts

```bash
npm run start:dev     # watch mode
npm run start:prod    # node dist/main
npm run build
npm run lint
npm run format
```
