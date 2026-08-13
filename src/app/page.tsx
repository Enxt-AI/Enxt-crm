"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ComBrainApp from "../components/combrain-app";
import { UserAccount } from "../lib/types";
import { ShieldCheck, UserCheck, Sparkles, ArrowRight, Brain, CheckCircle2, Lock, LogOut, ExternalLink } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("combrain_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.id) {
              setCurrentUser(parsed);
            }
          } catch (_) {}
        }
      }

      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("combrain_user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.warn("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Strict Login Requirement: Render ComBrainApp ONLY if user is logged in
  if (currentUser) {
    return (
      <div>
        {/* Top Session Bar */}
        <div style={{ background: "rgba(15, 18, 26, 0.95)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "#d1d5db" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ padding: "2px 8px", borderRadius: "10px", background: currentUser.role === "superadmin" ? "rgba(168, 85, 247, 0.2)" : "rgba(16, 185, 129, 0.2)", color: currentUser.role === "superadmin" ? "#c084fc" : "#34d399", fontWeight: 600, border: currentUser.role === "superadmin" ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)" }}>
              {currentUser.role === "superadmin" ? "👑 Super Admin" : "👔 Manager"}
            </span>
            <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("combrain_user");
              }
              await fetch("/api/auth/logout", { method: "POST" });
              setCurrentUser(null);
              window.location.href = "/";
            }}
            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 600 }}
          >
            <LogOut size={14} /> Switch Account / Logout
          </button>
        </div>

        <ComBrainApp currentUser={currentUser} />
      </div>
    );
  }

  return (
    <main className="app-shell" style={{ minHeight: "100vh", position: "relative", overflowY: "auto", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {/* Background Animated Orbs */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124, 58, 237, 0.18) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Top Header Navbar */}
      <header style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)" }}>
            <Brain size={22} style={{ color: "#ffffff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--ink)", letterSpacing: "-0.5px" }}>ComBrain</h1>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>AI CRM & HRMS Portal</span>
          </div>
        </div>
      </header>

      {/* Hero Content Section */}
      <section style={{ flex: 1, width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "16px 24px 60px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "20px", background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", color: "#7e22ce", fontSize: "0.85rem", fontWeight: 700, marginBottom: "20px" }}>
          <Sparkles size={16} /> Document-Native AI Company Brain & RBAC Portal
        </div>

        {/* Hero Title */}
        <h1 style={{ fontSize: "2.6rem", fontWeight: 800, lineHeight: 1.18, margin: "0 0 14px 0", color: "var(--ink)", maxWidth: "820px", letterSpacing: "-0.8px" }}>
          Manage Your Business Smarter with <span style={{ background: "linear-gradient(135deg, #7c3aed 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ComBrain</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: "1.05rem", color: "var(--muted)", maxWidth: "700px", margin: "0 0 28px 0", lineHeight: 1.55, fontWeight: 500 }}>
          Unified CRM, HRMS, Project Management, Attendance, WhatsApp Reminders, and Role-Based Access Control engineered for modern teams.
        </p>

        {/* Two Glassmorphic Login Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", width: "100%", maxWidth: "820px" }}>
          {/* Super Admin Login Card */}
          <div className="panel" style={{ padding: "28px 24px", border: "1.5px solid rgba(168, 85, 247, 0.35)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(168, 85, 247, 0.2))", border: "1px solid rgba(168, 85, 247, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <ShieldCheck size={32} style={{ color: "#7e22ce" }} />
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--ink)" }}>Super Admin Login</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 20px 0", lineHeight: 1.5, fontWeight: 500 }}>
              Executive control panel for founders & system administrators with full permissions across all modules.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600 }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#7c3aed" }} /> Manager Provisioning & Permission Matrix
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#7c3aed" }} /> Full Financials, Payroll & Subscription Access
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#7c3aed" }} /> System Audit Logs & Master AI Founder Chat
              </li>
            </ul>

            <Link
              href="/login/superadmin"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(147, 51, 234, 0.35)"
              }}
            >
              Login as Super Admin <ArrowRight size={18} />
            </Link>
          </div>

          {/* Manager Login Card */}
          <div className="panel" style={{ padding: "28px 24px", border: "1.5px solid rgba(16, 185, 129, 0.35)", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", transition: "transform 0.2s, box-shadow 0.2s" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <UserCheck size={32} style={{ color: "#047857" }} />
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--ink)" }}>Manager Login</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 20px 0", lineHeight: 1.5, fontWeight: 500 }}>
              Authorized department portal for Engineering, CRM Sales, and HR Team Leads with customized sidebar access.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600 }}>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#059669" }} /> Custom Module Views based on Assigned Role
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#059669" }} /> Department Task & Project Management
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} style={{ color: "#059669" }} /> Protected Financial Privacy & Salary Safeguards
              </li>
            </ul>

            <Link
              href="/login/manager"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)"
              }}
            >
              Login as Manager <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

