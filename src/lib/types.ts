export type DocumentType = "employee" | "project" | "client" | "lead" | "system" | "subscription";

export type BrainField = string | number | boolean | string[];

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

export type UserRole = "superadmin" | "manager" | "employee";

export type ModuleKey = 
  | "dashboard"
  | "employees"
  | "projects"
  | "tasks"
  | "crm"
  | "documents"
  | "whatsapp"
  | "managers"
  | "subscriptions";

export interface ManagerPermission {
  id?: string;
  manager_id?: string;
  module_key: ModuleKey;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  is_active: boolean;
  password?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: ManagerPermission[];
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  target_user_id?: string;
  details: string;
  created_at: string;
}
