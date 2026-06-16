# Enxt Brain Product Plan

## Updated Transcript

The product name is **Enxt Brain**.

Enxt Brain is an AI SLM company brain for Inext AI. It should help the founder manage employees, projects, clients, leads, and company operations from one clean interface.

Everything should be stored in documents. Employees, projects, clients, leads, notes, policies, and updates should all be represented as documents with structured metadata. The UI can show these documents as tables, dashboards, CRM boards, and project views.

The AI should be able to answer questions about the company and also change records such as employees, projects, clients, and leads. These changes should be clean and controlled. The preferred workflow is for AI to propose a document change, show it clearly, and apply it after founder approval.

The Google Sheet intake is only a one-time import and should not be the focus right now. It can be added later.

For the first version, use demo information:

- 10 demo employees
- 10 detailed demo AI project documents
- A set of demo clients
- A set of demo leads
- A proper CRM-style view for pipeline and client management

The app should use Next.js, stay lightweight, be easy to deploy, and later use Pinecone as the vector database for semantic company memory.

## MVP Scope

1. Build a lightweight Next.js dashboard.
2. Treat every company object as a document.
3. Add demo employees, AI projects, clients, and leads.
4. Show founder-friendly views derived from documents:
   - Command dashboard
   - Employee registry
   - Project document workspace
   - CRM client portfolio
   - Lead pipeline board
   - Document editor
   - AI chat panel
5. Add an AI write flow:
   - Founder requests a change
   - AI identifies the target document
   - AI drafts a change request
   - Founder approves or rejects
   - Approved change updates the document
6. Add real AI, persistence, Pinecone, auth, audit logs, and Google Sheet import after the UX is validated.

## Later Architecture

```text
Next.js App
  - Founder dashboard
  - CRM views
  - Employee views
  - Project views
  - Document editor
  - AI chat and write approval queue

Document Store
  - Employees as documents
  - Projects as documents
  - Clients as documents
  - Leads as documents
  - Policies, notes, meetings, and founder memos as documents

Structured Database
  - Document metadata
  - Versions
  - Permissions
  - Audit logs
  - User accounts

Pinecone
  - Embedded document chunks
  - Semantic search
  - Retrieval for AI answers

AI Layer
  - Retrieval
  - Answer generation
  - Change proposal generation
  - Diff review
  - Approved writeback
```

## Security Requirements

- Founder/admin authentication
- Role-based access later if the team expands
- Sensitive employee fields masked by default
- Version history for every document
- Audit log for AI reads and writes
- Approval required before AI mutates company memory
- Encryption for sensitive identity and payroll fields
