import { NextResponse } from 'next/server';
import { getRBACStore, logAuditEvent } from '../../../../lib/auth-service';
import { ALL_MODULES } from '../../../../lib/auth-store';

export async function POST(request: Request) {
  try {
    const { email, password, expectedRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password.' }, { status: 400 });
    }

    const store = await getRBACStore();
    const cleanEmail = email.trim().toLowerCase();

    const user = store.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid email address or password.' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Your account is currently disabled. Please contact your Super Admin.' },
        { status: 403 }
      );
    }

    if (expectedRole && user.role !== expectedRole) {
      return NextResponse.json(
        {
          error: `Access Denied: This portal requires a ${
            expectedRole === 'superadmin' ? 'Super Admin' : 'Manager'
          } account. Your role is "${user.role}".`,
        },
        { status: 403 }
      );
    }

    // Attach permissions
    let permissions = store.permissions[user.id] || [];
    if (user.role === 'superadmin') {
      permissions = ALL_MODULES.map((m) => ({
        module_key: m.key,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      }));
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      is_active: user.is_active,
      permissions,
    };

    await logAuditEvent(
      'User Login',
      user.email,
      user.id,
      `Successfully logged into ${user.role} portal.`
    );

    const response = NextResponse.json({
      success: true,
      user: userSession,
    });

    response.cookies.set('enxt_session', JSON.stringify(userSession), {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Authentication error' }, { status: 500 });
  }
}
