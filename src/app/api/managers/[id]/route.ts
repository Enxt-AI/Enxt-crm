import { NextResponse } from 'next/server';
import { getRBACStore, saveRBACStore, logAuditEvent } from '../../../../lib/auth-service';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const managerId = params.id;
    const body = await request.json();
    const { name, email, department, is_active, permissions, password, performedBy } = body;

    const store = await getRBACStore();
    const userIndex = store.users.findIndex((u) => u.id === managerId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'Manager account not found.' }, { status: 404 });
    }

    const existing = store.users[userIndex];
    const updatedUser = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim().toLowerCase() : existing.email,
      department: department !== undefined ? department : existing.department,
      is_active: is_active !== undefined ? is_active : existing.is_active,
      password: password !== undefined && password.trim() !== '' ? password.trim() : existing.password,
      updated_at: new Date().toISOString(),
    };

    store.users[userIndex] = updatedUser;

    if (permissions && Array.isArray(permissions)) {
      store.permissions[managerId] = permissions;
    }

    await saveRBACStore(store);

    await logAuditEvent(
      'Permissions Updated',
      performedBy || 'Super Admin',
      managerId,
      `Updated permissions and profile for manager ${updatedUser.name} (${updatedUser.email}).`
    );

    return NextResponse.json({
      success: true,
      manager: { ...updatedUser, permissions: store.permissions[managerId] },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update manager' }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const managerId = params.id;
    const { action, performedBy, newPassword } = await request.json();

    const store = await getRBACStore();
    const user = store.users.find((u) => u.id === managerId);

    if (!user) {
      return NextResponse.json({ error: 'Manager account not found.' }, { status: 404 });
    }

    if (action === 'toggle_status') {
      user.is_active = !user.is_active;
      await saveRBACStore(store);

      await logAuditEvent(
        user.is_active ? 'Manager Enabled' : 'Manager Disabled',
        performedBy || 'Super Admin',
        managerId,
        `${user.is_active ? 'Enabled' : 'Disabled'} access for manager ${user.name}.`
      );

      return NextResponse.json({ success: true, is_active: user.is_active });
    }

    if (action === 'reset_password') {
      if (!newPassword) {
        return NextResponse.json({ error: 'New password is required.' }, { status: 400 });
      }
      user.password = newPassword.trim();
      await saveRBACStore(store);

      await logAuditEvent(
        'Password Reset',
        performedBy || 'Super Admin',
        managerId,
        `Reset password for manager ${user.name}.`
      );

      return NextResponse.json({ success: true, message: 'Password reset successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to patch manager' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const managerId = params.id;
    const url = new URL(request.url);
    const performedBy = url.searchParams.get('performedBy') || 'Super Admin';

    const store = await getRBACStore();
    const user = store.users.find((u) => u.id === managerId);

    if (!user) {
      return NextResponse.json({ error: 'Manager account not found.' }, { status: 404 });
    }

    if (user.role === 'superadmin') {
      return NextResponse.json({ error: 'Super Admin accounts cannot be deleted.' }, { status: 403 });
    }

    store.users = store.users.filter((u) => u.id !== managerId);
    delete store.permissions[managerId];

    await saveRBACStore(store);

    await logAuditEvent(
      'Manager Deleted',
      performedBy,
      managerId,
      `Permanently deleted manager account ${user.name} (${user.email}).`
    );

    return NextResponse.json({ success: true, message: 'Manager deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete manager' }, { status: 500 });
  }
}
