import { NextResponse } from 'next/server';
import { getRBACStore, saveRBACStore, logAuditEvent } from '../../../lib/auth-service';
import { UserAccount, ManagerPermission } from '../../../lib/types';
import { ALL_MODULES } from '../../../lib/auth-store';

export async function GET() {
  try {
    const store = await getRBACStore();
    const managers = store.users.map((user) => ({
      ...user,
      permissions: store.permissions[user.id] || ALL_MODULES.map(m => ({ module_key: m.key, can_view: false, can_create: false, can_edit: false, can_delete: false }))
    }));

    return NextResponse.json({
      success: true,
      managers,
      audit_logs: store.audit_logs || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch managers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, department, is_active, permissions, performedBy } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const store = await getRBACStore();
    const cleanEmail = email.trim().toLowerCase();

    if (store.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return NextResponse.json({ error: 'A user account with this email address already exists.' }, { status: 400 });
    }

    const managerId = `usr-mgr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newManager: UserAccount = {
      id: managerId,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: 'manager',
      department: department || 'Operations',
      is_active: is_active !== false,
      created_at: new Date().toISOString()
    };

    store.users.push(newManager);
    store.permissions[managerId] = permissions || ALL_MODULES.map(m => ({ module_key: m.key, can_view: true, can_create: true, can_edit: true, can_delete: false }));

    await saveRBACStore(store);

    await logAuditEvent(
      'Manager Created',
      performedBy || 'Super Admin',
      managerId,
      `Created manager ${newManager.name} (${newManager.email}) in ${newManager.department} department.`
    );

    return NextResponse.json({
      success: true,
      manager: { ...newManager, permissions: store.permissions[managerId] }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create manager' }, { status: 500 });
  }
}
