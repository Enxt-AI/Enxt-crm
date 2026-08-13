"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, Briefcase, AlertCircle, Loader2 } from "lucide-react";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, expectedRole: "manager" })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Store in localStorage for instant client access and hard redirect
      if (typeof window !== "undefined") {
        localStorage.setItem("enxt_user", JSON.stringify(data.user));
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflowY: "auto", padding: "24px", boxSizing: "border-box" }}>
      {/* Glow Orbs */}
      <div style={{ position: "absolute", top: "20%", right: "15%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "15%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "460px", zIndex: 10 }}>
        {/* Back Link */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--muted)", fontSize: "0.88rem", textDecoration: "none", marginBottom: "20px", fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Portal Landing
        </Link>

        {/* Light-Themed Card */}
        <div className="panel" style={{ padding: "36px 32px", border: "1px solid var(--line)", background: "var(--panel, #ffffff)", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <UserCheck size={28} style={{ color: "#047857" }} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 6px 0", color: "var(--ink)" }}>Manager Portal</h2>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)", fontWeight: 500 }}>Authorized department access & workspace control</p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", fontSize: "0.85rem", color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Fake hidden inputs to trick browser password autofill */}
            <input type="text" name="fake_email_prevent_autofill" style={{ display: "none" }} tabIndex={-1} autoComplete="off" readOnly />
            <input type="password" name="fake_password_prevent_autofill" style={{ display: "none" }} tabIndex={-1} autoComplete="new-password" readOnly />

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", marginBottom: "6px" }}>Company Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  type="email"
                  required
                  name="enxt_mgr_email_field"
                  id="enxt_mgr_email_field"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@enxtbrain.com"
                  style={{ width: "100%", padding: "12px 14px 12px 42px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "10px", color: "var(--ink)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name="enxt_mgr_password_field"
                  id="enxt_mgr_password_field"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", background: "var(--surface, rgba(0,0,0,0.03))", border: "1px solid var(--line)", borderRadius: "10px", color: "var(--ink)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontWeight: 500 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--muted)", cursor: "pointer", fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#059669", borderRadius: "4px" }}
                />
                Remember me
              </label>
              <button type="button" onClick={() => alert("Please contact your Super Admin to reset manager passwords.")} style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", padding: 0, fontWeight: 700 }}>
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
                marginTop: "8px"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Briefcase size={18} /> Sign In as Manager
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
