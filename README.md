# Enxt Brain

Enxt Brain is a lightweight Next.js prototype for an Enxt AI company brain. It starts as a document-native CRM and founder dashboard for employees, AI projects, clients, and leads.

## Current MVP

- Founder command dashboard
- Employee registry with 10 demo employees
- AI project workspace with 10 detailed demo project documents
- CRM portfolio with demo clients and lead pipeline
- Document store where every record is represented as editable company memory
- Founder chat mock with guarded AI write requests and approval queue

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Product Principle

Documents are the source of truth. Tables, CRM boards, dashboards, and AI answers should be generated from documents and structured metadata, not from disconnected views.

The future AI layer should retrieve documents, answer questions with grounded context, and propose edits through an approval flow before company memory changes.
