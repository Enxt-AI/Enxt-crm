"use client";

import React, { useState, useEffect } from "react";
import { UserAccount, ManagerPermission, AuditLog, ModuleKey } from "../lib/types";
import { ALL_MODULES, getDefaultPermissionsForRole } from "../lib/auth-store";
import { 
  Search, ShieldCheck, KeyRound, 
  Trash2, Edit3, Power, X, MoreHorizontal, History, CheckSquare, Square
} from "lucide-react";

interface ManagersViewProps {
  currentUser?: UserAccount | null;
  onRefreshApp?: () => void;
}

export function ManagersView({ currentUser, onRefreshApp }: ManagersViewProps) {
  const [managers, setManagers] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<UserAccount | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    roleLabel: "",
    is_active: true
  });
  const [formPermissions, setFormPermissions] = useState<ManagerPermission[]>(
    getDefaultPermissionsForRole("project_manager")
  );

  // Reset Password Modal
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/managers");
      const data = await res.json();
      if (res.ok && data.success) {
        setManagers(data.managers || []);
        setAuditLogs(data.audit_logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const openCreateModal = () => {
    setEditingManager(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      department: "",
      roleLabel: "",
      is_active: true
    });
    setFormPermissions(getDefaultPermissionsForRole("project_manager"));
    setIsModalOpen(true);
  };

  const openEditModal = (mgr: UserAccount) => {
    setEditingManager(mgr);
    setFormData({
      name: mgr.name,
      email: mgr.email,
      password: mgr.password || "",
      department: mgr.department || "Operations",
      roleLabel: mgr.department || "Content Manager",
      is_active: mgr.is_active
    });
    setFormPermissions(
      mgr.permissions && mgr.permissions.length > 0
        ? mgr.permissions
        : getDefaultPermissionsForRole("project_manager")
    );
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingManager ? `/api/managers/${editingManager.id}` : "/api/managers";
      const method = editingManager ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          department: formData.roleLabel || formData.department,
          permissions: formPermissions,
          performedBy: currentUser?.email || "Super Admin"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to save manager.");
        return;
      }

      setIsModalOpen(false);
      fetchManagers();
      if (onRefreshApp) onRefreshApp();
    } catch (err: any) {
      alert(err.message || "Error saving manager");
    }
  };

  const handleToggleStatus = async (mgr: UserAccount) => {
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to ${mgr.is_active ? "disable" : "enable"} ${mgr.name}?`)) return;
    try {
      const res = await fetch(`/api/managers/${mgr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          performedBy: currentUser?.email || "Super Admin"
        })
      });
      if (res.ok) fetchManagers();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDeleteManager = async (mgr: UserAccount) => {
    setActiveMenuId(null);
    if (!confirm(`Permanently delete manager ${mgr.name}? This action cannot be undone.`)) return;
    try {
      setManagers((prev) => prev.filter((m) => m.id !== mgr.id));
      const res = await fetch(`/api/managers/${mgr.id}?performedBy=${encodeURIComponent(currentUser?.email || "Super Admin")}`, {
        method: "DELETE"
      });
      fetchManagers();
    } catch (err) {
      console.error("Failed to delete manager:", err);
      fetchManagers();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;
    try {
      const res = await fetch(`/api/managers/${resetModalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          newPassword,
          performedBy: currentUser?.email || "Super Admin"
        })
      });
      if (res.ok) {
        alert(`Password for ${resetModalUser.name} reset successfully!`);
        setResetModalUser(null);
        setNewPassword("");
        fetchManagers();
      }
    } catch (err) {
      alert("Failed to reset password");
    }
  };

  const togglePermission = (moduleKey: ModuleKey) => {
    setFormPermissions((prev) =>
      prev.map((p) => {
        if (p.module_key === moduleKey) {
          const nextView = !p.can_view;
          return {
            ...p,
            can_view: nextView,
            can_create: nextView,
            can_edit: nextView,
            can_delete: false
          };
        }
        return p;
      })
    );
  };

  const selectAllPermissions = () => {
    setFormPermissions(ALL_MODULES.map((m) => ({ module_key: m.key, can_view: true, can_create: true, can_edit: true, can_delete: true })));
  };

  const clearAllPermissions = () => {
    setFormPermissions(ALL_MODULES.map((m) => ({ module_key: m.key, can_view: false, can_create: false, can_edit: false, can_delete: false })));
  };

  const filteredManagers = managers.filter((m) => {
    if (m.role === "superadmin") return false;
    return `${m.name} ${m.email} ${m.department} ${m.role}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedPermCount = formPermissions.filter((p) => p.can_view).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar matching Reference Screenshot 1 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 6px 0", color: "var(--ink)", letterSpacing: "-0.5px" }}>
            Panel User Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--muted)" }}>
            Manage panel users — Support Agents, Content Managers, Operations, Accountants, Marketing Managers.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            padding: "12px 24px",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "#ffffff",
            border: "none",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)"
          }}
        >
          + Add Manager
        </button>
      </div>

      {/* Search Bar & User Count */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 46px", background: "var(--surface, rgba(0,0,0,0.04))", border: "1px solid var(--line)", borderRadius: "999px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
          />
        </div>

        <span style={{ fontSize: "0.9rem", color: "var(--muted)", fontWeight: 600 }}>
          {filteredManagers.length} users
        </span>
      </div>

      {/* Table Container */}
      <div className="panel" style={{ padding: 0, overflow: "visible", borderRadius: "16px", border: "1px solid var(--line)", position: "relative" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "rgba(0, 0, 0, 0.03)", borderBottom: "1px solid var(--line)", color: "var(--muted)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.8px", fontWeight: 800 }}>
              <th style={{ padding: "16px 24px" }}>NAME</th>
              <th style={{ padding: "16px 24px" }}>EMAIL</th>
              <th style={{ padding: "16px 24px" }}>ROLE</th>
              <th style={{ padding: "16px 24px" }}>PERMISSIONS</th>
              <th style={{ padding: "16px 24px" }}>CREATED</th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>Loading panel users...</td>
              </tr>
            ) : filteredManagers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>No panel users found.</td>
              </tr>
            ) : (
              filteredManagers.map((mgr) => {
                const isSuperAdmin = mgr.role === "superadmin";
                const permCount = isSuperAdmin ? ALL_MODULES.length : (mgr.permissions || []).filter((p) => p.can_view).length;
                const roleBadgeText = mgr.department || (isSuperAdmin ? "Super Admin" : "Content Manager");

                return (
                  <tr key={mgr.id} style={{ borderBottom: "1px solid var(--line)", transition: "background 0.15s" }}>
                    {/* NAME */}
                    <td style={{ padding: "18px 24px" }}>
                      <strong style={{ color: "var(--ink)", fontSize: "0.95rem", fontWeight: 800 }}>{mgr.name}</strong>
                    </td>

                    {/* EMAIL */}
                    <td style={{ padding: "18px 24px", color: "var(--ink)", fontWeight: 500 }}>
                      {mgr.email}
                    </td>

                    {/* ROLE (High-contrast Soft Purple Pill Badge) */}
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{ padding: "5px 14px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700, background: "rgba(147, 51, 234, 0.12)", color: "#7e22ce", border: "1px solid rgba(147, 51, 234, 0.3)", display: "inline-block" }}>
                        {roleBadgeText}
                      </span>
                    </td>

                    {/* PERMISSIONS */}
                    <td style={{ padding: "18px 24px", color: "var(--ink)", fontWeight: 600 }}>
                      {permCount} permissions
                    </td>

                    {/* CREATED */}
                    <td style={{ padding: "18px 24px", color: "var(--muted)", fontWeight: 500 }}>
                      {mgr.created_at ? new Date(mgr.created_at).toLocaleDateString("en-US") : "7/16/2026"}
                    </td>

                    {/* ACTIONS (High-contrast Green Action Menu Button) */}
                    <td style={{ padding: "18px 24px", textAlign: "right", position: "relative" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === mgr.id ? null : mgr.id);
                        }}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "rgba(16, 185, 129, 0.15)",
                          border: "1.5px solid rgba(16, 185, 129, 0.4)",
                          color: "#047857",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s"
                        }}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === mgr.id && (
                        <>
                          {/* Invisible Backdrop to dismiss menu on click outside */}
                          <div
                            onClick={() => setActiveMenuId(null)}
                            style={{ position: "fixed", inset: 0, zIndex: 999 }}
                          />

                          <div style={{ position: "absolute", right: "24px", top: "50px", background: "#ffffff", border: "1px solid var(--line)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)", zIndex: 1000, width: "170px", padding: "6px 0", textAlign: "left" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                openEditModal(mgr);
                              }}
                              style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", color: "#111827", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}
                            >
                              <Edit3 size={15} style={{ color: "#059669" }} /> Edit Permissions
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                handleDeleteManager(mgr);
                              }}
                              style={{ width: "100%", padding: "10px 16px", background: "none", border: "none", color: "#dc2626", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "8px" }}
                            >
                              <Trash2 size={15} style={{ color: "#dc2626" }} /> Delete User
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Security Audit Logs */}
      <div className="panel" style={{ padding: "20px 24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <History size={18} style={{ color: "#059669" }} />
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--ink)" }}>Audit Activity Log</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
          {auditLogs.slice(0, 6).map((log) => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0, 0, 0, 0.02)", border: "1px solid var(--line)", borderRadius: "8px", padding: "10px 14px", fontSize: "0.82rem" }}>
              <div>
                <strong style={{ color: "#059669", marginRight: "8px", fontWeight: 700 }}>[{log.action}]</strong>
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>{log.details}</span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 600 }}>
                {log.performed_by} • {log.created_at ? log.created_at.slice(0, 10) : "Today"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PERMISSIONS MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="panel" style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "28px", border: "1px solid var(--line)", background: "var(--panel, #ffffff)", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)" }}>
                  {editingManager ? "Edit Permissions" : "Add Manager"}
                </h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                  Update permissions for <strong style={{ color: "var(--ink)" }}>{formData.name || "New User"}</strong> ({formData.roleLabel})
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveManager} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Fake hidden inputs to prevent password autofill */}
              <input type="text" name="fake_modal_user_name" style={{ display: "none" }} tabIndex={-1} autoComplete="off" readOnly />
              <input type="password" name="fake_modal_user_pass" style={{ display: "none" }} tabIndex={-1} autoComplete="new-password" readOnly />

              {/* Basic Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    name="mgr_fullname_nocache"
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    style={{ width: "100%", padding: "9px 12px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Email</label>
                  <input
                    type="email"
                    required
                    name="mgr_email_nocache"
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="manager@combrain.com"
                    style={{ width: "100%", padding: "9px 12px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Role Designation</label>
                  <input
                    type="text"
                    required
                    name="mgr_role_nocache"
                    autoComplete="off"
                    value={formData.roleLabel}
                    onChange={(e) => setFormData({ ...formData, roleLabel: e.target.value })}
                    placeholder="e.g. Content Manager"
                    style={{ width: "100%", padding: "9px 12px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>Password</label>
                  <input
                    type="text"
                    required={!editingManager}
                    name="mgr_pass_nocache"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingManager ? "Leave blank to keep current password" : "Enter password"}
                    style={{ width: "100%", padding: "9px 12px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                  />
                </div>
              </div>

              {/* Counter & Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>
                  {selectedPermCount} permissions selected
                </span>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1.5px solid #10b981",
                      color: "#047857",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      background: "rgba(0, 0, 0, 0.04)",
                      border: "1px solid var(--line)",
                      color: "var(--muted)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Grouped Permission Checklist Card */}
              <div style={{ background: "var(--surface, rgba(0,0,0,0.02))", border: "1px solid var(--line)", borderRadius: "14px", padding: "16px", maxHeight: "320px", overflowY: "auto" }}>
                <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                  COMBRAIN MODULE PERMISSIONS
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ALL_MODULES.map((m) => {
                    const isChecked = Boolean(formPermissions.find((p) => p.module_key === m.key)?.can_view);

                    return (
                      <div
                        key={m.key}
                        onClick={() => togglePermission(m.key)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          background: isChecked ? "rgba(16, 185, 129, 0.08)" : "transparent",
                          transition: "background 0.15s"
                        }}
                      >
                        <div style={{ marginTop: "2px" }}>
                          {isChecked ? (
                            <CheckSquare size={20} style={{ color: "#059669" }} />
                          ) : (
                            <Square size={20} style={{ color: "var(--muted)" }} />
                          )}
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--ink)", fontWeight: 700 }}>
                            {m.label}
                          </strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500 }}>
                            Manage {m.label.toLowerCase()} in COMBRAIN panel
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "999px",
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
                  }}
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="panel" style={{ width: "100%", maxWidth: "420px", padding: "24px", border: "1px solid var(--line)", background: "var(--panel, #ffffff)", borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)" }}>Reset Password for {resetModalUser.name}</h3>
              <button type="button" onClick={() => setResetModalUser(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", marginBottom: "6px" }}>New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: "100%", padding: "10px 12px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--ink)", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setResetModalUser(null)} style={{ padding: "8px 14px", borderRadius: "999px", background: "rgba(0, 0, 0, 0.05)", border: "1px solid var(--line)", color: "var(--ink)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 18px", borderRadius: "999px", background: "#eab308", border: "none", color: "#000", fontSize: "0.85rem", fontWeight: 800, cursor: "pointer" }}>
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

