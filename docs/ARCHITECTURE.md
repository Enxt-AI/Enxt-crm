# Enxt Brain Architecture

## Core Idea

Enxt Brain should be document-native. A document is the source record, and every product surface is a projection of those documents.

For example:

- Employee table = employee documents
- Project dashboard = project documents
- CRM board = lead and client documents
- AI chat context = retrieved document chunks
- AI edits = proposed document changes

## Current Prototype

The prototype stores demo documents in `src/lib/demo-documents.ts` and keeps runtime edits in browser state. This is intentionally lightweight so the founder workflow can be validated before adding infrastructure.

## Production Shape

The production version should split storage into three layers:

1. **Document database**
   Stores canonical documents, metadata, versions, permissions, and audit logs.

2. **Vector database**
   Pinecone stores embedded chunks for semantic retrieval.

3. **AI orchestration**
   The AI layer retrieves relevant documents, answers questions, drafts edits, and applies approved changes.

## AI Write Flow

```text
Founder asks for a change
  -> AI identifies target document(s)
  -> AI drafts a structured change
  -> UI shows readable diff
  -> Founder approves or rejects
  -> Approved change creates a new document version
  -> Updated document is embedded into Pinecone
  -> Audit log records who/what/when/why
```

## Deferred Work

- Google Sheet one-time import
- Real authentication
- Persistent database
- Pinecone indexing
- Real model integration
- File uploads
- Document version diff UI
- Permissions and audit logs
