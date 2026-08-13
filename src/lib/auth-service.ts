import { supabase } from './supabase';
import { UserAccount, ManagerPermission, AuditLog } from './types';
import { INITIAL_USERS, INITIAL_PERMISSIONS, INITIAL_AUDIT_LOGS } from './auth-store';

export interface RBACStoreData {
  users: UserAccount[];
  permissions: Record<string, ManagerPermission[]>;
  audit_logs: AuditLog[];
}

export async function getRBACStore(): Promise<RBACStoreData> {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', 'rbac_data')
      .single();

    if (error || !data?.data) {
      const initial: RBACStoreData = {
        users: INITIAL_USERS,
        permissions: INITIAL_PERMISSIONS,
        audit_logs: INITIAL_AUDIT_LOGS,
      };
      await saveRBACStore(initial);
      return initial;
    }
    const store = data.data as RBACStoreData;

    // Migrate superadmin email if it is old
    let rbacModified = false;
    if (store.users) {
      store.users = store.users.map((u) => {
        if (u.id === "usr-admin-01" && u.email === "admin@combrain.com") {
          rbacModified = true;
          return { ...u, email: "admin@combrain.com" };
        }
        return u;
      });
    }
    if (store.audit_logs) {
      store.audit_logs = store.audit_logs.map((log) => {
        if (log.performed_by === "admin@combrain.com") {
          rbacModified = true;
          return { ...log, performed_by: "admin@combrain.com" };
        }
        return log;
      });
    }
    if (rbacModified) {
      await saveRBACStore(store);
    }

    // Filter out legacy demo seed accounts so only Super Admin and admin-created managers exist
    const seededIds = ["usr-rahul-02", "usr-amit-03", "usr-priya-04"];
    if (store.users) {
      store.users = store.users.filter((u) => !seededIds.includes(u.id));
    }
    return store;
  } catch (err) {
    console.warn('[auth-service] Supabase query fallback to initial:', err);
    return {
      users: INITIAL_USERS,
      permissions: INITIAL_PERMISSIONS,
      audit_logs: INITIAL_AUDIT_LOGS,
    };
  }
}

export async function saveRBACStore(store: RBACStoreData): Promise<void> {
  try {
    await supabase.from('app_data').upsert({
      key: 'rbac_data',
      data: store,
    });
  } catch (err) {
    console.error('[auth-service] Failed to save RBAC store to Supabase:', err);
  }
}

export async function logAuditEvent(
  action: string,
  performedBy: string,
  targetUserId?: string,
  details?: string
): Promise<AuditLog> {
  const store = await getRBACStore();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    performed_by: performedBy,
    target_user_id: targetUserId,
    details: details || '',
    created_at: new Date().toISOString(),
  };
  store.audit_logs = [newLog, ...(store.audit_logs || [])];
  await saveRBACStore(store);
  return newLog;
}

