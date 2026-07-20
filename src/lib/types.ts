export type DocumentType = "employee" | "project" | "client" | "lead" | "system" | "subscription";

export type BrainField = string | number | string[];

export type BrainDocument = {
  id: string;
  type: DocumentType;
  title: string;
  status: string;
  owner: string;
  updatedAt: string;
  tags: string[];
  fields: Record<string, BrainField>;
  body: string;
};

export type ChatMessage = {
  id: string;
  role: "founder" | "brain";
  content: string;
};

export type ChangeRequest = {
  id: string;
  targetDocumentId: string;
  title: string;
  summary: string;
  status: "pending" | "applied" | "rejected";
};
export interface ZohoInvoice {
  invoice_id: string;
  customer_name: string;
  total: number;
  due_date: string;
  status: string;
  // Add any other fields you need
}

export interface ZohoSubscription {
  subscription_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  // Add any other fields you need
}
