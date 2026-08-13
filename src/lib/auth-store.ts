import { UserAccount, ManagerPermission, AuditLog, ModuleKey } from "./types";
import { supabase } from "./supabase";

export const ALL_MODULES: { key: ModuleKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "employees", label: "Employees" },
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "crm", label: "CRM Pipeline" },
  { key: "documents", label: "Documents" },
  { key: "whatsapp", label: "WhatsApp Broadcast" },
  { key: "subscriptions", label: "Subscriptions" }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr-admin-01",
    name: "Super Admin",
    email: "admin@combrain.com",
    password: "Admin@123",
    role: "superadmin",
    department: "Executive",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z"
  }
];

export const INITIAL_PERMISSIONS: Record<string, ManagerPermission[]> = {};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-101",
    action: "System Initialized",
    performed_by: "System",
    details: "RBAC engine initialized with default accounts and seeded permissions.",
    created_at: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "log-102",
    action: "Manager Created",
    performed_by: "admin@combrain.com",
    target_user_id: "usr-rahul-02",
    details: "Created manager Rahul Verma for Engineering department.",
    created_at: "2026-02-10T10:30:00.000Z"
  },
  {
    id: "log-103",
    action: "Permissions Updated",
    performed_by: "admin@combrain.com",
    target_user_id: "usr-amit-03",
    details: "Assigned Sales & CRM Manager Preset permissions to Amit Sharma.",
    created_at: "2026-02-12T14:15:00.000Z"
  }
];

export function getDefaultPermissionsForRole(presetName: "all" | "readonly" | "project_manager" | "hr_manager"): ManagerPermission[] {
  return ALL_MODULES.map((m) => {
    if (presetName === "all") {
      return { module_key: m.key, can_view: true, can_create: true, can_edit: true, can_delete: true };
    }
    if (presetName === "readonly") {
      return { module_key: m.key, can_view: true, can_create: false, can_edit: false, can_delete: false };
    }
    if (presetName === "project_manager") {
      const isProj = ["dashboard", "projects", "tasks", "documents"].includes(m.key);
      return {
        module_key: m.key,
        can_view: m.key !== "subscriptions",
        can_create: isProj,
        can_edit: isProj,
        can_delete: m.key === "tasks"
      };
    }
    if (presetName === "hr_manager") {
      const isHR = ["dashboard", "employees", "documents"].includes(m.key);
      return {
        module_key: m.key,
        can_view: isHR,
        can_create: isHR,
        can_edit: isHR,
        can_delete: m.key === "employees"
      };
    }
    return { module_key: m.key, can_view: true, can_create: false, can_edit: false, can_delete: false };
  });
}

