"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="app-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "24px" }}>
      <div style={{ position: "absolute", top: "25%", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div className="panel" style={{ width: "100%", maxWidth: "480px", padding: "40px 32px", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.25)", background: "rgba(23, 27, 38, 0.9)", backdropFilter: "blur(20px)", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)", zIndex: 10 }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
          <ShieldAlert size={32} style={{ color: "#ef4444" }} />
        </div>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 10px 0", color: "#fff" }}>Access Denied</h2>
        <p style={{ margin: "0 0 24px 0", fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.5 }}>
          You do not have permission to access this panel module or administration route. Please contact your Super Admin to request additional access.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <ArrowLeft size={16} /> Return to Portal
          </Link>
          <Link
            href="/login/superadmin"
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              border: "none",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Lock size={16} /> Super Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}
