# CDPS AI Scaling & Data Residency: Production Scaling Blueprint

## Context & Objectives
To support the Chief Data and Policy Strategy (CDPS) branch in processing 10,000+ public consultation entries, we must evolve the existing Gamification (n8n) prototype into a robust batch-processing pipeline. The primary goals are extracting "Thematic Sentiment Analysis" and identifying "Policy Patterns" while strictly adhering to ECCC's data sovereignty and Protected B standards.

## 1. High-Volume Ingestion & Batch-Processing Strategy

Handling 10,000+ records in a single n8n execution will result in memory overloads and API timeouts. We require a batching strategy.

### 1.1 Trigger and Queue System
- **Ingestion:** Public consultation entries (CSV/JSON files or database entries) are loaded into a distinct "Intake Queue" (e.g., SharePoint List, Azure Storage Queue, or PostgreSQL table).
- **n8n Trigger:** Instead of processing a whole file, an n8n workflow operates on a CRON schedule (e.g., every 5 minutes) or is triggered via a webhook when a new batch is ready.
- **Batch Size:** The workflow queries the Intake Queue for a manageable batch size (e.g., 50–100 records per run).

### 1.2 Loop and State Management
- **The "Split in Batches" Node:** In n8n, utilize the "Split In Batches" node to process each record individually or in small micro-batches within the run.
- **Status Tracking:** Each record must have a state (e.g., `Pending`, `Processing`, `Completed`, `Failed`). The workflow updates the database immediately after processing to ensure idempotency. If a run fails, the next run picks up the `Pending` or `Failed` items.
- **API Rate Limiting:** Introduce "Wait" nodes (e.g., 1-second delay between LLM calls) or leverage n8n's built-in rate-limiting features for HTTP requests to prevent triggering Azure OpenAI's "429 Too Many Requests" errors.

## 2. Sliding Window Approach for LLM Context Limits

Large public consultation submissions (e.g., a 20-page PDF attachment) will exceed the token limit of the LLM or dilute the focus of the Prompt.

### 2.1 The Chunking Utility
Responses must be broken down before reaching the LLM node.
1. **Pre-processing:** Feed the document through the Python-based `chunking_utility.py` (external logic called via n8n's Execute Command node or an Azure Function).
2. **Chunk Size:** Define chunks based on logical boundaries (e.g., paragraphs) or strict token limits (e.g., 1000 tokens), with an overlap (e.g., 100 tokens) to preserve context between chunks.

### 2.2 Preserving Metadata Integrity
When a single entry is split into 10 chunks, each chunk *must* carry the parent ECCC metadata.
- **Schema:**
  ```json
  {
    "consultation_id": "CONS-2026-A",
    "entry_id": "ENTRY-4092",
    "chunk_index": 3,
    "total_chunks": 10,
    "received_date": "2026-03-01",
    "text_content": "..."
  }
  ```

### 2.3 Re-assembly (Map-Reduce)
- **Map Phase:** The LLM (via n8n) processes each chunk individually, extracting themes and sentiments.
- **Reduce Phase:** A secondary n8n workflow or script aggregates the responses for `ENTRY-4092` and prompts the LLM for a final, synthesized summary of the entire document.

## 3. Data Residency Alignment
- All textual analysis and generation must occur via **Azure OpenAI instances hosted in Canadian regions** (e.g., `Canada East`).
- File storage for inputs and outputs must remain in ECCC's secure tenant (M365/SharePoint) or Canadian Azure Blob Storage. Open-source or public API endpoints (like standard OpenAI or Anthropic endpoints) that route data outside Canada are strictly prohibited for Protected B data.

## 4. Error Handling and Resilience
- **Dead Letter Queue (DLQ):** Entries that repeatedly fail processing (e.g., due to malformed data or timeout) are moved to a DLQ for manual review.
- **Retry Logic:** Configure n8n HTTP Request nodes to automatically retry (e.g., 3 times with exponential backoff) if they encounter transient network errors.
