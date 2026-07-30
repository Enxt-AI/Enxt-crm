"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, Briefcase, AlertCircle, Loader2 } from "lucide-react";

export default function ManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("rahul@enxtbrain.com");
  const [password, setPassword] = useState("Rahul@123");
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

  const selectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <main className="app-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "24px" }}>
      {/* Glow Orbs */}
      <div style={{ position: "absolute", top: "20%", right: "15%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "15%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "460px", zIndex: 10 }}>
        {/* Back Link */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--muted)", fontSize: "0.88rem", textDecoration: "none", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Portal Landing
        </Link>

        {/* Card */}
        <div className="panel" style={{ padding: "36px 32px", border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(23, 27, 38, 0.85)", backdropFilter: "blur(20px)", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))", border: "1px solid rgba(16, 185, 129, 0.4)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <UserCheck size={28} style={{ color: "#10b981" }} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 6px 0", color: "#fff" }}>Manager Portal</h2>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>Authorized department access & workspace control</p>
          </div>

          {/* Quick Demo Selector */}
          <div style={{ marginBottom: "20px" }}>
            <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Quick Select Demo Manager:</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => selectDemoAccount("rahul@enxtbrain.com", "Rahul@123")}
                style={{ padding: "8px 6px", borderRadius: "8px", border: email === "rahul@enxtbrain.com" ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)", background: email === "rahul@enxtbrain.com" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)", color: "#fff", fontSize: "0.75rem", cursor: "pointer", textAlign: "center" }}
              >
                <strong>Rahul</strong> (Projects)
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount("amit@enxtbrain.com", "Amit@123")}
                style={{ padding: "8px 6px", borderRadius: "8px", border: email === "amit@enxtbrain.com" ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)", background: email === "amit@enxtbrain.com" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)", color: "#fff", fontSize: "0.75rem", cursor: "pointer", textAlign: "center" }}
              >
                <strong>Amit</strong> (Sales/CRM)
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount("priya@enxtbrain.com", "Priya@123")}
                style={{ padding: "8px 6px", borderRadius: "8px", border: email === "priya@enxtbrain.com" ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)", background: email === "priya@enxtbrain.com" ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)", color: "#fff", fontSize: "0.75rem", cursor: "pointer", textAlign: "center" }}
              >
                <strong>Priya</strong> (HR & Ops)
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", fontSize: "0.85rem", color: "#fca5a5", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#d1d5db", marginBottom: "6px" }}>Company Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@enxtbrain.com"
                  style={{ width: "100%", padding: "12px 14px 12px 42px", background: "rgba(15, 18, 26, 0.8)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#d1d5db", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: "100%", padding: "12px 42px 12px 42px", background: "rgba(15, 18, 26, 0.8)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#9ca3af", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#10b981", borderRadius: "4px" }}
                />
                Remember me
              </label>
              <button type="button" onClick={() => alert("Please contact your Super Admin to reset manager passwords.")} style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", padding: 0, fontWeight: 500 }}>
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
                color: "#fff",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
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
