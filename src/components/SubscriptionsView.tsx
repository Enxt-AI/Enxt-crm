"use client";

import React, { useState, useMemo } from "react";
import { 
  CreditCard, Search, Plus, Filter, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, X, Edit, Trash2, Download, Eye, FileText, 
  TrendingUp, AlertTriangle, ArrowUpRight, DollarSign, PieChart, Sparkles, 
  Bot, Clock, CheckCircle2, ShieldCheck, Mail, Cloud, Globe, Briefcase, 
  Palette, Code, Lock, Play, Layers, MessageSquare, Terminal, HelpCircle, FileCheck, RefreshCw, ExternalLink
} from "lucide-react";
import type { BrainDocument } from "../lib/types";

interface SubscriptionsViewProps {
  subscriptions: BrainDocument[];
  employees: any[];
  onAddSubscription: (fields: Record<string, any>) => void;
  onUpdateSubscription: (id: string, fields: Record<string, any>) => void;
  onDeleteSubscription: (id: string) => void;
  onViewDocument?: (doc: { label: string; url: string }) => void;
}

// Color/Icon map for categories
const CATEGORIES: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  "AI Tools": { label: "AI Tools", color: "#a855f7", bg: "#faf5ff", icon: Sparkles },
  "Cloud Hosting": { label: "Cloud Hosting", color: "#3b82f6", bg: "#eff6ff", icon: Cloud },
  "CRM": { label: "CRM", color: "#10b981", bg: "#ecfdf5", icon: Briefcase },
  "HR Software": { label: "HR Software", color: "#14b8a6", bg: "#f0fdfa", icon: ShieldCheck },
  "Communication": { label: "Communication", color: "#6366f1", bg: "#e0e7ff", icon: MessageSquare },
  "Productivity": { label: "Productivity", color: "#ec4899", bg: "#fdf2f8", icon: CheckCircle2 },
  "Design": { label: "Design", color: "#ef4444", bg: "#fef2f2", icon: Palette },
  "Development": { label: "Development", color: "#0f172a", bg: "#f8fafc", icon: Code },
  "Security": { label: "Security", color: "#06b6d4", bg: "#ecfeff", icon: Lock },
  "Marketing": { label: "Marketing", color: "#f59e0b", bg: "#fffbeb", icon: TrendingUp },
  "Analytics": { label: "Analytics", color: "#8b5cf6", bg: "#f5f3ff", icon: PieChart },
  "Domains": { label: "Domains", color: "#22c55e", bg: "#f0fdf4", icon: Globe },
  "Email Services": { label: "Email Services", color: "#64748b", bg: "#f8fafc", icon: Mail },
  "Finance": { label: "Finance", color: "#eab308", bg: "#fefce8", icon: DollarSign },
  "Other": { label: "Other", color: "#78716c", bg: "#fafaf9", icon: HelpCircle }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

const DEPARTMENTS = ["Enxt AI", "Sales & CRM", "HR & Admin", "Marketing", "Engineering", "Design", "Finance", "Founder Office", "Operations"];
const BILLING_CYCLES = ["Monthly", "Quarterly", "Yearly"];
const STATUSES = ["Active", "Due Soon", "Renewal Needed", "Expired"];

export default function SubscriptionsView({
  subscriptions,
  employees,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  onViewDocument
}: SubscriptionsViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "table" | "calendar" | "analytics">("dashboard");

  // Filtering states
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBilling, setSelectedBilling] = useState("All");

  // Selection states
  const [selectedSub, setSelectedSub] = useState<BrainDocument | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState<BrainDocument | null>(null);

  // AI insights state
  const [aiReportText, setAiReportText] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form Fields State
  const [formFields, setFormFields] = useState<Record<string, any>>({
    serviceName: "",
    vendor: "",
    website: "",
    category: "AI Tools",
    description: "",
    billingCycle: "Monthly",
    currency: "INR",
    cost: "",
    tax: "",
    totalAmount: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    startDate: new Date().toISOString().slice(0, 10),
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    expiryDate: "",
    owner: "",
    department: "Enxt AI",
    paymentMethod: "Credit Card",
    invoiceNumber: "",
    billingEmail: "",
    autoRenewal: true,
    status: "Active",
    notes: ""
  });

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calViewMode, setCalViewMode] = useState<"month" | "week">("month");

  // Helpers
  const asText = (sub: BrainDocument, key: string) => String(sub.fields?.[key] ?? "");
  const asNumber = (sub: BrainDocument, key: string) => Number(sub.fields?.[key] ?? 0);
  const asBool = (sub: BrainDocument, key: string) => !!sub.fields?.[key];

  const parseToISODate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    if (clean.toLowerCase() === "na" || clean.toLowerCase() === "tbd" || clean.toLowerCase() === "missing" || !clean) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    const slashParts = clean.split("/");
    if (slashParts.length === 3) {
      let d = parseInt(slashParts[0], 10);
      let m = parseInt(slashParts[1], 10);
      let y = parseInt(slashParts[2], 10);
      if (slashParts[0].length === 4) { y = parseInt(slashParts[0], 10); m = parseInt(slashParts[1], 10); d = parseInt(slashParts[2], 10); }
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        if (y < 100) y += 2000;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    }
    try {
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    } catch (_) {}
    return null;
  };

  // Convert USD to INR (rough conversion rate 84)
  const toINR = (amount: number, currency: string) => {
    return currency === "USD" ? amount * 84 : amount;
  };

  // Calculate normalized monthly cost
  const getMonthlyCost = (sub: BrainDocument) => {
    const cost = asNumber(sub, "cost") || asNumber(sub, "totalAmount") || 0;
    const currency = asText(sub, "currency") || "INR";
    const cycle = asText(sub, "billingCycle") || "Monthly";
    const costInr = toINR(cost, currency);
    if (cycle === "Yearly") return costInr / 12;
    if (cycle === "Quarterly") return costInr / 3;
    return costInr;
  };

  const getYearlyCost = (sub: BrainDocument) => {
    return getMonthlyCost(sub) * 12;
  };

  // Filtered List
  const filteredSubs = useMemo(() => {
    return subscriptions.filter((sub) => {
      const name = sub.title || asText(sub, "serviceName");
      const vendor = asText(sub, "vendor");
      const owner = asText(sub, "owner");
      const dept = asText(sub, "department");
      const cat = asText(sub, "category");
      const cycle = asText(sub, "billingCycle");
      const status = asText(sub, "status") || "Active";

      const query = searchText.trim().toLowerCase();
      const matchesSearch = !query || 
        name.toLowerCase().includes(query) ||
        vendor.toLowerCase().includes(query) ||
        owner.toLowerCase().includes(query);

      const matchesCat = selectedCategory === "All" || cat === selectedCategory;
      const matchesDept = selectedDepartment === "All" || dept === selectedDepartment;
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      const matchesCycle = selectedBilling === "All" || cycle === selectedBilling;

      return matchesSearch && matchesCat && matchesDept && matchesStatus && matchesCycle;
    });
  }, [subscriptions, searchText, selectedCategory, selectedDepartment, selectedStatus, selectedBilling]);

  // Overall KPIs
  const kpiMetrics = useMemo(() => {
    const active = subscriptions.filter(s => (s.fields?.status || "Active") === "Active");
    const uniqueVendors = new Set(subscriptions.map(s => asText(s, "vendor")).filter(Boolean));
    
    let totalMonthly = 0;
    let totalYearly = 0;
    let renewalsThisMonth = 0;
    let expiringSoonCount = 0;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    subscriptions.forEach((sub) => {
      totalMonthly += getMonthlyCost(sub);
      totalYearly += getYearlyCost(sub);

      const renewal = parseToISODate(asText(sub, "renewalDate"));
      if (renewal) {
        const renDate = new Date(renewal);
        if (renDate >= startOfMonth && renDate <= endOfMonth) {
          renewalsThisMonth++;
        }
        if (renDate >= today && renDate <= thirtyDaysFromNow && asText(sub, "status") !== "Expired") {
          expiringSoonCount++;
        }
      }
    });

    return {
      monthlyCost: totalMonthly,
      yearlyCost: totalYearly,
      activeCount: active.length,
      renewalsThisMonth,
      expiringSoon: expiringSoonCount,
      vendorsCount: uniqueVendors.size
    };
  }, [subscriptions]);

  // Category Distribution for Donut chart
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      const cat = asText(sub, "category") || "Other";
      const monthly = getMonthlyCost(sub);
      map[cat] = (map[cat] || 0) + monthly;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Status breakdown
  const statusStats = useMemo(() => {
    const active = subscriptions.filter(s => (s.fields?.status || "Active") === "Active").length;
    const dueSoon = subscriptions.filter(s => s.fields?.status === "Due Soon").length;
    const renewalNeeded = subscriptions.filter(s => s.fields?.status === "Renewal Needed").length;
    const expired = subscriptions.filter(s => s.fields?.status === "Expired").length;
    return { active, dueSoon, renewalNeeded, expired };
  }, [subscriptions]);

  // Spend trend per month (over departments)
  const departmentSpendStats = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      const dept = asText(sub, "department") || "Unassigned";
      const monthly = getMonthlyCost(sub);
      map[dept] = (map[dept] || 0) + monthly;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [subscriptions]);

  // AI recommendations compiler
  const aiInsights = useMemo(() => {
    const list: string[] = [];
    const duplicates: Record<string, string[]> = {};
    let totalAnnualSavings = 0;

    subscriptions.forEach((sub) => {
      const nameKey = (sub.title || asText(sub, "serviceName")).toLowerCase().trim();
      const dept = asText(sub, "department");
      if (!duplicates[nameKey]) duplicates[nameKey] = [];
      if (dept) duplicates[nameKey].push(dept);
    });

    Object.entries(duplicates).forEach(([name, depts]) => {
      if (depts.length > 1) {
        const uniqueDepts = Array.from(new Set(depts));
        if (uniqueDepts.length > 1) {
          list.push(`Duplicate Service: "${name.toUpperCase()}" is being paid for across multiple departments (${uniqueDepts.join(", ")}). Consolidating licenses could save up to 15% annually.`);
          totalAnnualSavings += 24000; // estimated consolidation savings
        }
      }
    });

    const expiring = subscriptions.filter(s => {
      const ren = parseToISODate(asText(s, "renewalDate"));
      if (!ren) return false;
      const days = Math.ceil((new Date(ren).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 15;
    });

    if (expiring.length > 0) {
      list.push(`${expiring.length} subscription(s) will renew within the next 15 days. Verify budget allocations before renewal date.`);
    }

    const unassigned = subscriptions.filter(s => !asText(s, "owner"));
    if (unassigned.length > 0) {
      list.push(`Missing Ownership: ${unassigned.length} subscriptions have no owner assigned. Assign owners to avoid renewal bottlenecks.`);
    }

    if (list.length === 0) {
      list.push("All subscriptions are optimized! No redundancies or unassigned tool ownerships detected.");
    }

    return {
      recommendations: list,
      annualSavings: totalAnnualSavings
    };
  }, [subscriptions]);

  // AI executive report draft generator
  const generateAiReport = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const report = `### CRM AI Subscription Spending Audit Report\n` +
        `**Generated on**: ${today}\n` +
        `**Total Monthly Spend**: ${formatCurrency(kpiMetrics.monthlyCost)}\n` +
        `**Total Projected Annual Spend**: ${formatCurrency(kpiMetrics.yearlyCost)}\n` +
        `**Active Vendors**: ${kpiMetrics.vendorsCount} providers\n\n` +
        `#### Key Recommendations & Audit Findings:\n` +
        aiInsights.recommendations.map(r => `* ${r}`).join("\n") + "\n\n" +
        `#### Cost Optimization Opportunities:\n` +
        `* **Duplicate Software Consolidation**: Potential savings of **${formatCurrency(aiInsights.annualSavings)} / Year** by merging seats under single billing portals.\n` +
        `* **Auto-renewal review**: Expired / inactive software accounts should be canceled or downgraded.\n\n` +
        `*Report drafted successfully. Review recommendations in the financial review.*`;
      setAiReportText(report);
      setIsGeneratingAi(false);
    }, 1200);
  };

  // Drag handles for Calendar View
  const handleCalendarNavigate = (dir: "prev" | "next") => {
    const step = calViewMode === "month" ? 1 : 7;
    const temp = new Date(currentDate);
    if (calViewMode === "month") {
      temp.setMonth(temp.getMonth() + (dir === "prev" ? -1 : 1));
    } else {
      temp.setDate(temp.getDate() + (dir === "prev" ? -7 : 7));
    }
    setCurrentDate(temp);
  };

  // Month days calculator
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const startDay = startOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Pre-buffer
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, dateStr: d.toISOString().slice(0, 10), isCurrentMonth: false });
    }

    // Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, dateStr: d.toISOString().slice(0, 10), isCurrentMonth: true });
    }

    // Post-buffer (fill to 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, dateStr: d.toISOString().slice(0, 10), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Week days calculator
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - dayOfWeek);
    
    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({ date: d, dateStr: d.toISOString().slice(0, 10) });
    }
    return days;
  }, [currentDate]);

  // Export handlers
  const exportData = (format: "csv" | "excel") => {
    let content = "";
    if (format === "csv") {
      content = "Service Name,Vendor,Category,Plan,Billing Cycle,Cost,Renewal Date,Auto Renewal,Owner,Department,Status\n" +
        filteredSubs.map(s => {
          const name = s.title || asText(s, "serviceName");
          const costVal = `${asText(s, "currency")} ${asNumber(s, "cost")}`;
          return `"${name}","${asText(s, "vendor")}","${asText(s, "category")}","${asText(s, "plan") || "Default"}","${asText(s, "billingCycle")}","${costVal}","${asText(s, "renewalDate")}","${asBool(s, "autoRenewal") ? "Yes" : "No"}","${asText(s, "owner")}","${asText(s, "department")}","${asText(s, "status") || "Active"}"`;
        }).join("\n");

      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Subscriptions_Report_${new Date().toISOString().slice(0,10)}.csv`);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      alert("Excel export report downloaded in CSV fallback format successfully.");
      exportData("csv");
    }
  };

  // Form submit add/edit handler
  const handleFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    const computedTotal = Number(formFields.cost || 0) + Number(formFields.tax || 0);
    const finalFields = {
      ...formFields,
      totalAmount: computedTotal
    };

    if (isEditing) {
      onUpdateSubscription(isEditing.id, finalFields);
      setIsEditing(null);
    } else {
      onAddSubscription(finalFields);
      setIsAddingNew(false);
    }

    // Reset Form
    setFormFields({
      serviceName: "",
      vendor: "",
      website: "",
      category: "AI Tools",
      description: "",
      billingCycle: "Monthly",
      currency: "INR",
      cost: "",
      tax: "",
      totalAmount: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
      startDate: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      expiryDate: "",
      owner: "",
      department: "Enxt AI",
      paymentMethod: "Credit Card",
      invoiceNumber: "",
      billingEmail: "",
      autoRenewal: true,
      status: "Active",
      notes: ""
    });
  };

  const startEdit = (sub: BrainDocument) => {
    setIsEditing(sub);
    setFormFields({
      serviceName: sub.title || asText(sub, "serviceName"),
      vendor: asText(sub, "vendor"),
      website: asText(sub, "website"),
      category: asText(sub, "category") || "AI Tools",
      description: sub.body || asText(sub, "description"),
      billingCycle: asText(sub, "billingCycle") || "Monthly",
      currency: asText(sub, "currency") || "INR",
      cost: asNumber(sub, "cost") || "",
      tax: asNumber(sub, "tax") || "",
      totalAmount: asNumber(sub, "totalAmount") || "",
      purchaseDate: parseToISODate(asText(sub, "purchaseDate")) || new Date().toISOString().slice(0, 10),
      startDate: parseToISODate(asText(sub, "startDate")) || new Date().toISOString().slice(0, 10),
      renewalDate: parseToISODate(asText(sub, "renewalDate")) || new Date().toISOString().slice(0, 10),
      expiryDate: parseToISODate(asText(sub, "expiryDate")) || "",
      owner: asText(sub, "owner"),
      department: asText(sub, "department") || "Enxt AI",
      paymentMethod: asText(sub, "paymentMethod") || "Credit Card",
      invoiceNumber: asText(sub, "invoiceNumber"),
      billingEmail: asText(sub, "billingEmail"),
      autoRenewal: sub.fields.autoRenewal !== undefined ? !!sub.fields.autoRenewal : true,
      status: asText(sub, "status") || "Active",
      notes: asText(sub, "notes")
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", height: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom styles for Subscriptions view responsiveness */
        .subscriptions-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }
        .subscriptions-tabs-container {
          display: flex;
          gap: 6px;
          background: rgba(0, 0, 0, 0.03);
          padding: 4px;
          border-radius: 10px;
          width: fit-content;
          max-width: 100%;
          border: 1px solid var(--line);
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
        }
        .subscriptions-tabs-container::-webkit-scrollbar {
          display: none;
        }
        .subscriptions-filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          width: 100%;
        }
        .subscriptions-table-container {
          overflow-x: auto;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: white;
          width: 100%;
        }
        .subscriptions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.82rem;
          min-width: 800px;
        }
        .subscriptions-calendar-month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--line);
          border-radius: 8px;
          overflow: hidden;
          width: 100%;
        }
        .subscriptions-calendar-day-cell {
          background: white;
          min-height: 100px;
          padding: 8px;
          border: 1px solid rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .subscriptions-calendar-week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          width: 100%;
        }
        .subscriptions-analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .subscriptions-donut-box {
          display: flex;
          gap: 16px;
          align-items: center;
          min-height: 220px;
        }
        .subscriptions-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-height: 400px;
          overflow-y: auto;
          padding: 20px;
        }
        .side-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          align-items: stretch;
        }
        .side-drawer-panel {
          background: white;
          width: 460px;
          max-width: 100%;
          height: 100%;
          box-shadow: -4px 0 24px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          z-index: 1001;
        }
        
        @media (max-width: 950px) {
          .subscriptions-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 900px) {
          .subscriptions-calendar-week-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 800px) {
          .subscriptions-analytics-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .subscriptions-filter-bar > * {
            flex-grow: 1;
            width: 100%;
          }
          .subscriptions-filter-bar .notch-search {
            max-width: 100% !important;
          }
          .subscriptions-calendar-day-cell {
            min-height: 60px !important;
            padding: 4px !important;
          }
          .subscriptions-calendar-day-cell span {
            font-size: 0.65rem !important;
          }
          .subscriptions-calendar-event-pill {
            padding: 2px 4px !important;
            font-size: 0.6rem !important;
          }
          .subscriptions-donut-box {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
        @media (max-width: 600px) {
          .subscriptions-calendar-week-grid {
            grid-template-columns: 1fr;
          }
          .side-drawer-backdrop {
            align-items: flex-end;
          }
          .side-drawer-panel {
            width: 100%;
            height: 85%;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
          }
          .subscriptions-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 14px !important;
          }
          .employee-edit-modal {
            width: 95% !important;
            margin: 10px !important;
            max-height: 90vh !important;
          }
        }
      `}} />
      
      {/* HEADER SECTION */}
      <header className="employee-title-block" style={{ marginBottom: "0px" }}>
        <div>
          <p className="eyebrow">Financial Operations</p>
          <h3>SaaS & Subscription Manager</h3>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            className="primary-button"
            onClick={() => {
              setIsAddingNew(true);
              setIsEditing(null);
            }}
            type="button"
          >
            <Plus size={16} />
            <span style={{ marginLeft: "6px" }}>Add Subscription</span>
          </button>
        </div>
      </header>

      {/* METRIC TOP CARDS */}
      <section className="metric-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px" }}>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Monthly Cost</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0" }}>{formatCurrency(kpiMetrics.monthlyCost)}</h3>
        </div>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Yearly Cost</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0" }}>{formatCurrency(kpiMetrics.yearlyCost)}</h3>
        </div>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Active Tools</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0" }}>{kpiMetrics.activeCount} <span style={{ fontSize: "0.75rem", color: "var(--green)" }}>🟢 On</span></h3>
        </div>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Renewals (Month)</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0", color: kpiMetrics.renewalsThisMonth > 0 ? "var(--amber)" : "var(--ink)" }}>{kpiMetrics.renewalsThisMonth}</h3>
        </div>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Expiring Soon</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0", color: kpiMetrics.expiringSoon > 0 ? "var(--red)" : "var(--ink)" }}>{kpiMetrics.expiringSoon}</h3>
        </div>
        <div className="panel-soft" style={{ padding: "16px", borderRadius: "12px", background: "var(--panel)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>Vendors</span>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "6px 0 0 0" }}>{kpiMetrics.vendorsCount}</h3>
        </div>
      </section>

      {/* TABS SELECTOR */}
      <div className="subscriptions-tabs-container">
        <button 
          onClick={() => setActiveTab("dashboard")} 
          className="text-button"
          style={{ padding: "6px 14px", borderRadius: "8px", background: activeTab === "dashboard" ? "white" : "transparent", color: activeTab === "dashboard" ? "var(--ink)" : "var(--muted)", fontWeight: 700, border: "none", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Bot size={14} />
          <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab("table")} 
          className="text-button"
          style={{ padding: "6px 14px", borderRadius: "8px", background: activeTab === "table" ? "white" : "transparent", color: activeTab === "table" ? "var(--ink)" : "var(--muted)", fontWeight: 700, border: "none", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <CreditCard size={14} />
          <span>Active Subscriptions</span>
        </button>
        <button 
          onClick={() => setActiveTab("calendar")} 
          className="text-button"
          style={{ padding: "6px 14px", borderRadius: "8px", background: activeTab === "calendar" ? "white" : "transparent", color: activeTab === "calendar" ? "var(--ink)" : "var(--muted)", fontWeight: 700, border: "none", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <CalendarIcon size={14} />
          <span>Renewal Calendar</span>
        </button>
        <button 
          onClick={() => setActiveTab("analytics")} 
          className="text-button"
          style={{ padding: "6px 14px", borderRadius: "8px", background: activeTab === "analytics" ? "white" : "transparent", color: activeTab === "analytics" ? "var(--ink)" : "var(--muted)", fontWeight: 700, border: "none", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <TrendingUp size={14} />
          <span>Cost Analytics</span>
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="subscriptions-dashboard-grid">
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Quick Renewal Alerts */}
            <div className="panel" style={{ padding: "20px" }}>
              <div className="panel-heading" style={{ marginBottom: "12px" }}>
                <div>
                  <p className="eyebrow">Priorities</p>
                  <h3>Renewal Notifications</h3>
                </div>
                <AlertTriangle size={18} style={{ color: "var(--red)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {subscriptions.filter((s) => {
                  const ren = parseToISODate(asText(s, "renewalDate"));
                  if (!ren) return false;
                  const days = Math.ceil((new Date(ren).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return days >= 0 && days <= 30 && asText(s, "status") !== "Expired";
                }).slice(0, 3).map((sub) => {
                  const ren = parseToISODate(asText(sub, "renewalDate"));
                  const days = Math.ceil((new Date(ren!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const label = sub.title || asText(sub, "serviceName");
                  return (
                    <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "10px 14px", background: days <= 7 ? "#fef2f2" : "#fffbeb", borderRadius: "8px", borderLeft: `4px solid ${days <= 7 ? "var(--red)" : "var(--amber)"}` }}>
                      <div>
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{label} ({asText(sub, "vendor")})</strong>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>Owner: {asText(sub, "owner") || "Unassigned"} | Dept: {asText(sub, "department")}</p>
                      </div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: days <= 7 ? "var(--red)" : "var(--amber)" }}>
                        Renewing in {days} {days === 1 ? "day" : "days"}
                      </span>
                    </div>
                  );
                })}
                {subscriptions.filter((s) => asText(s, "status") === "Expired").map((sub) => (
                  <div key={sub.id} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", borderLeft: "4px solid var(--red)" }}>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>❌ {sub.title || asText(sub, "serviceName")}</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>Vendor: {asText(sub, "vendor")} | Expiry: {asText(sub, "expiryDate") || "N/A"}</p>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--red)" }}>EXPIRED</span>
                  </div>
                ))}
                {subscriptions.filter(s => {
                  const ren = parseToISODate(asText(s, "renewalDate"));
                  const days = ren ? Math.ceil((new Date(ren).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
                  return (days >= 0 && days <= 30) || asText(s, "status") === "Expired";
                }).length === 0 && (
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontStyle: "italic" }}>No immediate subscription renewals (next 30 days). All clear! ✨</span>
                )}
              </div>
            </div>

            {/* Quick Summary list of high spending tools */}
            <div className="panel" style={{ padding: "20px" }}>
              <div className="panel-heading" style={{ marginBottom: "12px" }}>
                <div>
                  <p className="eyebrow">Spending</p>
                  <h3>Top Subscriptions by Cost</h3>
                </div>
                <CreditCard size={18} style={{ color: "var(--green)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...subscriptions]
                  .sort((a, b) => getMonthlyCost(b) - getMonthlyCost(a))
                  .slice(0, 4)
                  .map((sub) => {
                    const label = sub.title || asText(sub, "serviceName");
                    const iconConfig = CATEGORIES[asText(sub, "category")] || CATEGORIES["Other"];
                    const CatIcon = iconConfig.icon;
                    return (
                      <div key={sub.id} onClick={() => setSelectedSub(sub)} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "8px", cursor: "pointer", background: "white", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ padding: "8px", borderRadius: "6px", background: iconConfig.bg, color: iconConfig.color }}>
                            <CatIcon size={14} />
                          </div>
                          <div>
                            <strong style={{ fontSize: "0.85rem" }}>{label}</strong>
                            <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "var(--muted)" }}>{asText(sub, "category")} | {asText(sub, "billingCycle")}</p>
                          </div>
                        </div>
                        <strong style={{ fontSize: "0.85rem" }}>
                          {formatCurrency(getMonthlyCost(sub))}<span style={{ fontSize: "0.68rem", fontWeight: 500, color: "var(--muted)" }}>/mo</span>
                        </strong>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE AI INSIGHTS BAR */}
          <aside className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="panel-heading" style={{ marginBottom: "0px" }}>
              <div>
                <p className="eyebrow">Audit Assistant</p>
                <h3 style={{ display: "flex", alignItems: "center", gap: "6px" }}><Bot size={16} style={{ color: "var(--green)" }} /> AI Insights</h3>
              </div>
            </div>
            
            <div style={{ fontSize: "0.82rem", lineHeight: "1.4", color: "var(--ink-light)" }}>
              {aiReportText ? (
                <div style={{ whiteSpace: "pre-line", padding: "10px", background: "rgba(22, 120, 79, 0.04)", borderRadius: "8px", border: "1px solid rgba(22, 120, 79, 0.15)", color: "var(--ink)", overflowY: "auto", maxHeight: "320px" }}>
                  {aiReportText}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {aiInsights.recommendations.map((rec, index) => (
                    <div key={index} style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "var(--green)", fontWeight: 800 }}>•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                  {aiInsights.annualSavings > 0 && (
                    <div style={{ padding: "10px", background: "#f0fdf4", border: "1.5px dashed var(--green)", borderRadius: "8px", color: "var(--green)", fontWeight: 700, fontSize: "0.78rem" }}>
                      Projected potential savings: {formatCurrency(aiInsights.annualSavings)}/Year!
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              className="primary-button" 
              onClick={generateAiReport} 
              disabled={isGeneratingAi}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Scanning Software...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{aiReportText ? "Regenerate Report" : "Generate AI Report"}</span>
                </>
              )}
            </button>
          </aside>

        </div>
      )}

      {/* ACTIVE SUBSCRIPTIONS TABLE TAB */}
      {activeTab === "table" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 20px" }}>
          
          {/* SEARCH & FILTERS BAR */}
          <div className="subscriptions-filter-bar">
            <div className="notch-search" style={{ margin: 0, flexGrow: 1, minWidth: "200px", border: "1px solid var(--line)" }}>
              <Search size={14} />
              <input 
                placeholder="Search subscription name, vendor, owner..." 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                style={{ background: "transparent", border: "none" }}
              />
            </div>
            
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "0.82rem" }}>
              <option value="All">All Categories</option>
              {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "0.82rem" }}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "8px", fontSize: "0.82rem" }}>
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button className="secondary-button" onClick={() => exportData("csv")} title="Export report" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* TABLE CONTAINER */}
          <div className="subscriptions-table-container">
            <table className="subscriptions-table">
              <thead>
                <tr style={{ background: "rgba(0, 0, 0, 0.02)", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontWeight: 600 }}>
                  <th style={{ padding: "12px 14px" }}>Tool / Service</th>
                  <th style={{ padding: "12px 14px" }}>Category</th>
                  <th style={{ padding: "12px 14px" }}>Vendor</th>
                  <th style={{ padding: "12px 14px" }}>Cost (mo)</th>
                  <th style={{ padding: "12px 14px" }}>Billing Cycle</th>
                  <th style={{ padding: "12px 14px" }}>Renewal Date</th>
                  <th style={{ padding: "12px 14px" }}>Owner</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((sub) => {
                  const label = sub.title || asText(sub, "serviceName");
                  const cat = asText(sub, "category") || "Other";
                  const iconConfig = CATEGORIES[cat] || CATEGORIES["Other"];
                  const CatIcon = iconConfig.icon;
                  const status = asText(sub, "status") || "Active";
                  const cycle = asText(sub, "billingCycle") || "Monthly";

                  // Status Badge Styles
                  let badgeBg = "rgba(16, 185, 129, 0.1)";
                  let badgeColor = "#10b981";
                  if (status === "Due Soon") { badgeBg = "rgba(245, 158, 11, 0.1)"; badgeColor = "#f59e0b"; }
                  else if (status === "Renewal Needed") { badgeBg = "rgba(239, 68, 68, 0.1)"; badgeColor = "#ef4444"; }
                  else if (status === "Expired") { badgeBg = "rgba(100, 116, 139, 0.1)"; badgeColor = "#64748b"; }

                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--ink)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ padding: "6px", borderRadius: "5px", background: iconConfig.bg, color: iconConfig.color }}>
                            <CatIcon size={12} />
                          </div>
                          <span>{label}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>{cat}</td>
                      <td style={{ padding: "12px 14px" }}>{asText(sub, "vendor")}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{formatCurrency(getMonthlyCost(sub))}</td>
                      <td style={{ padding: "12px 14px" }}>{cycle}</td>
                      <td style={{ padding: "12px 14px" }}>{asText(sub, "renewalDate")}</td>
                      <td style={{ padding: "12px 14px" }}>{asText(sub, "owner") || "Unassigned"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button onClick={() => setSelectedSub(sub)} title="View details" className="icon-button compact">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => startEdit(sub)} title="Edit" className="icon-button compact">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => { if (window.confirm("Are you sure you want to delete this subscription?")) onDeleteSubscription(sub.id); }} title="Delete" className="icon-button compact" style={{ color: "var(--red)" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontStyle: "italic" }}>
                      No software subscriptions found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* RENEWAL CALENDAR TAB */}
      {activeTab === "calendar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Calendar Toolbar */}
          <div className="panel-soft" style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "white", borderRadius: "10px", border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => handleCalendarNavigate("prev")} className="icon-button compact"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="text-button" style={{ minHeight: "26px", fontSize: "0.75rem", padding: "0 8px" }}>Today</button>
                <button onClick={() => handleCalendarNavigate("next")} className="icon-button compact"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "4px", background: "rgba(0, 0, 0, 0.03)", padding: "3px", borderRadius: "6px" }}>
              <button onClick={() => setCalViewMode("month")} className="text-button" style={{ minHeight: "24px", fontSize: "0.72rem", padding: "0 10px", background: calViewMode === "month" ? "white" : "transparent", color: "var(--ink)", fontWeight: 700, borderRadius: "4px" }}>Month</button>
              <button onClick={() => setCalViewMode("week")} className="text-button" style={{ minHeight: "24px", fontSize: "0.72rem", padding: "0 10px", background: calViewMode === "week" ? "white" : "transparent", color: "var(--ink)", fontWeight: 700, borderRadius: "4px" }}>Week</button>
            </div>
          </div>

          {/* Month grid */}
          {calViewMode === "month" ? (
            <div className="panel" style={{ padding: "16px" }}>
              <div className="subscriptions-calendar-month-grid">
                {/* Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(h => (
                  <div key={h} style={{ background: "rgba(0, 0, 0, 0.02)", padding: "10px", textAlign: "center", fontWeight: 700, fontSize: "0.75rem", color: "var(--muted)" }}>{h}</div>
                ))}
                
                {/* Cells */}
                {calendarDays.map((day, idx) => {
                  const dateStr = day.dateStr;
                  const matches = subscriptions.filter(s => parseToISODate(asText(s, "renewalDate")) === dateStr);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  
                  return (
                    <div 
                      key={idx} 
                      className="subscriptions-calendar-day-cell"
                      style={{ background: isToday ? "rgba(22, 120, 79, 0.03)" : day.isCurrentMonth ? "white" : "#fafafa" }}
                    >
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isToday ? "var(--green)" : day.isCurrentMonth ? "var(--ink)" : "var(--muted)" }}>
                        {day.date.getDate()}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", maxHeight: "70px" }}>
                        {matches.map(s => {
                          const cat = asText(s, "category") || "Other";
                          const iconConfig = CATEGORIES[cat] || CATEGORIES["Other"];
                          return (
                            <div 
                              key={s.id} 
                              onClick={() => setSelectedSub(s)}
                              className="subscriptions-calendar-event-pill"
                              style={{ padding: "2px 6px", borderRadius: "4px", background: iconConfig.bg, color: iconConfig.color, borderLeft: `2.5px solid ${iconConfig.color}`, fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
                              title={s.title || asText(s, "serviceName")}
                            >
                              💳 {s.title || asText(s, "serviceName")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Week grid
            <div className="panel" style={{ padding: "16px" }}>
              <div className="subscriptions-calendar-week-grid">
                {weekDays.map((day) => {
                  const dateStr = day.dateStr;
                  const matches = subscriptions.filter(s => parseToISODate(asText(s, "renewalDate")) === dateStr);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);

                  return (
                    <div key={dateStr} style={{ border: "1px solid var(--line)", borderRadius: "8px", minHeight: "220px", padding: "10px", background: isToday ? "rgba(22, 120, 79, 0.03)" : "white" }}>
                      <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "6px", marginBottom: "8px", textAlign: "center" }}>
                        <strong style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{day.date.toLocaleDateString("en-US", { weekday: "short" })}</strong>
                        <h4 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", fontWeight: 800, color: isToday ? "var(--green)" : "var(--ink)" }}>{day.date.getDate()}</h4>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {matches.map(s => {
                          const cat = asText(s, "category") || "Other";
                          const iconConfig = CATEGORIES[cat] || CATEGORIES["Other"];
                          return (
                            <div 
                              key={s.id}
                              onClick={() => setSelectedSub(s)}
                              style={{ padding: "6px", borderRadius: "6px", background: iconConfig.bg, color: iconConfig.color, borderLeft: `3px solid ${iconConfig.color}`, cursor: "pointer" }}
                            >
                              <strong style={{ fontSize: "0.72rem", display: "block" }}>{s.title || asText(s, "serviceName")}</strong>
                              <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>Owner: {asText(s, "owner")}</span>
                            </div>
                          );
                        })}
                        {matches.length === 0 && <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic", display: "block", textAlign: "center", marginTop: "12px" }}>No Renewals</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* COST ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="subscriptions-analytics-grid">
          
          {/* Category costs donut */}
          <div className="panel" style={{ padding: "20px" }}>
            <div className="panel-heading" style={{ marginBottom: "12px" }}>
              <div>
                <p className="eyebrow">Allocation</p>
                <h3>Cost by Category</h3>
              </div>
            </div>
            
            <div className="subscriptions-donut-box">
              {/* SVG Donut */}
              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <svg width="100%" height="100%" viewBox="0 0 42 42" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f3f4" strokeWidth="5.5"></circle>
                  {(() => {
                    let accumulatedPercent = 0;
                    const totalCost = categoryStats.reduce((sum, item) => sum + item.value, 0);
                    
                    return categoryStats.map((item, idx) => {
                      if (totalCost === 0) return null;
                      const percent = (item.value / totalCost) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = 100 - accumulatedPercent;
                      accumulatedPercent += percent;
                      
                      const iconConfig = CATEGORIES[item.name] || CATEGORIES["Other"];
                      return (
                        <circle 
                          key={idx}
                          cx="21" 
                          cy="21" 
                          r="15.915" 
                          fill="transparent" 
                          stroke={iconConfig.color} 
                          strokeWidth="5.6" 
                          strokeDasharray={strokeDasharray} 
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    });
                  })()}
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--muted)", fontWeight: 600 }}>MONTHLY</span>
                  <strong style={{ display: "block", fontSize: "0.85rem", fontWeight: 800 }}>{formatCurrency(kpiMetrics.monthlyCost)}</strong>
                </div>
              </div>

              {/* Legends list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
                {categoryStats.slice(0, 5).map((item, idx) => {
                  const iconConfig = CATEGORIES[item.name] || CATEGORIES["Other"];
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: iconConfig.color }} />
                        <span>{item.name}</span>
                      </div>
                      <strong>{formatCurrency(item.value)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department spending Bar chart */}
          <div className="panel" style={{ padding: "20px" }}>
            <div className="panel-heading" style={{ marginBottom: "12px" }}>
              <div>
                <p className="eyebrow">Departments</p>
                <h3>Spending by Team</h3>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "220px", justifyContent: "center" }}>
              {departmentSpendStats.slice(0, 5).map((item, idx) => {
                const totalCost = departmentSpendStats.reduce((sum, i) => sum + i.value, 0);
                const percent = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
                
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <strong>{item.name}</strong>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(0,0,0,0.03)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${percent}%`, background: "var(--green)", borderRadius: "999px" }} />
                    </div>
                  </div>
                );
              })}
              {departmentSpendStats.length === 0 && <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic", textAlign: "center" }}>No departments costs tracked.</span>}
            </div>
          </div>

        </div>
      )}

      {/* SLIDING DETAILS DRAWER VIEW */}
      {selectedSub && (() => {
        const label = selectedSub.title || asText(selectedSub, "serviceName");
        const cat = asText(selectedSub, "category") || "Other";
        const iconConfig = CATEGORIES[cat] || CATEGORIES["Other"];
        const CatIcon = iconConfig.icon;
        const status = asText(selectedSub, "status") || "Active";
        const ren = parseToISODate(asText(selectedSub, "renewalDate"));
        const daysLeft = ren ? Math.ceil((new Date(ren).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

        return (
          <div className="side-drawer-backdrop" onClick={() => setSelectedSub(null)}>
            <div className="side-drawer-panel animate-slide-left" onClick={(e) => e.stopPropagation()}>
              
              <div className="drawer-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: iconConfig.bg, color: iconConfig.color }}>
                    <CatIcon size={18} />
                  </div>
                  <div>
                    <span className="eyebrow">{cat}</span>
                    <h3>{label}</h3>
                  </div>
                </div>
                <button className="icon-button" onClick={() => setSelectedSub(null)}><X size={18} /></button>
              </div>

              <div className="drawer-body">
                <div className="drawer-metric-grid">
                  <div className="drawer-metric">
                    <span>Monthly Spend</span>
                    <strong>{formatCurrency(getMonthlyCost(selectedSub))}</strong>
                  </div>
                  <div className="drawer-metric">
                    <span>Status</span>
                    <strong style={{ color: status === "Active" ? "var(--green)" : "var(--amber)" }}>{status}</strong>
                  </div>
                  <div className="drawer-metric">
                    <span>Billing Cycle</span>
                    <strong>{asText(selectedSub, "billingCycle") || "Monthly"}</strong>
                  </div>
                </div>

                <div className="drawer-info-list" style={{ marginTop: "16px" }}>
                  <div className="info-row">
                    <span>Vendor</span>
                    <strong>{asText(selectedSub, "vendor") || "N/A"}</strong>
                  </div>
                  <div className="info-row">
                    <span>Website URL</span>
                    <strong>
                      {asText(selectedSub, "website") ? (
                        <a href={asText(selectedSub, "website")} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          Open <ExternalLink size={11} />
                        </a>
                      ) : "N/A"}
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>Renewal Date</span>
                    <strong>{asText(selectedSub, "renewalDate") || "N/A"}</strong>
                  </div>
                  <div className="info-row">
                    <span>Days to Renewal</span>
                    <strong style={{ color: daysLeft !== null && daysLeft <= 7 ? "var(--red)" : "var(--ink)" }}>
                      {daysLeft !== null ? (daysLeft >= 0 ? `${daysLeft} Days` : "Expired") : "N/A"}
                    </strong>
                  </div>
                  <div className="info-row">
                    <span>Owner Responsible</span>
                    <strong>{asText(selectedSub, "owner") || "Unassigned"}</strong>
                  </div>
                  <div className="info-row">
                    <span>Department</span>
                    <strong>{asText(selectedSub, "department")}</strong>
                  </div>
                  <div className="info-row">
                    <span>Payment Method</span>
                    <strong>{asText(selectedSub, "paymentMethod")}</strong>
                  </div>
                  <div className="info-row">
                    <span>Billing Email</span>
                    <strong>{asText(selectedSub, "billingEmail") || "N/A"}</strong>
                  </div>
                </div>

                <div className="drawer-section border-top">
                  <h4>Service Notes</h4>
                  <p>{selectedSub.body || asText(selectedSub, "notes") || "No notes provided."}</p>
                </div>
              </div>

              <div className="drawer-footer">
                <button 
                  className="secondary-button"
                  onClick={() => {
                    startEdit(selectedSub);
                    setSelectedSub(null);
                  }}
                >
                  <Edit size={14} />
                  <span>Edit Subscription</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* QUICK ADD / EDIT MODAL */}
      {(isAddingNew || isEditing) && (
        <div className="modal-backdrop">
          <div className="employee-edit-panel employee-edit-modal" style={{ maxWidth: "680px" }}>
            
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Subscription</p>
                <h3>{isAddingNew ? "Add Subscription" : "Edit Subscription Details"}</h3>
              </div>
              <button className="icon-button" onClick={() => { setIsAddingNew(false); setIsEditing(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={handleFormSave}>
              <div className="subscriptions-form-grid">
                
                {/* Basic Info */}
                <label className="field-control">
                  <span>Service Name *</span>
                  <input type="text" required value={formFields.serviceName} onChange={(e) => setFormFields({ ...formFields, serviceName: e.target.value })} placeholder="e.g. OpenAI" />
                </label>

                <label className="field-control">
                  <span>Vendor *</span>
                  <input type="text" required value={formFields.vendor} onChange={(e) => setFormFields({ ...formFields, vendor: e.target.value })} placeholder="e.g. OpenAI Inc." />
                </label>

                <label className="field-control">
                  <span>Website URL</span>
                  <input type="url" value={formFields.website} onChange={(e) => setFormFields({ ...formFields, website: e.target.value })} placeholder="e.g. https://openai.com" />
                </label>

                <label className="field-control">
                  <span>Category</span>
                  <select value={formFields.category} onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}>
                    {Object.keys(CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                {/* Billing */}
                <label className="field-control">
                  <span>Billing Cycle</span>
                  <select value={formFields.billingCycle} onChange={(e) => setFormFields({ ...formFields, billingCycle: e.target.value })}>
                    {BILLING_CYCLES.map(cycle => <option key={cycle} value={cycle}>{cycle}</option>)}
                  </select>
                </label>

                <label className="field-control">
                  <span>Currency</span>
                  <select value={formFields.currency} onChange={(e) => setFormFields({ ...formFields, currency: e.target.value })}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </label>

                <label className="field-control">
                  <span>Base Cost *</span>
                  <input type="number" required min="0" value={formFields.cost} onChange={(e) => setFormFields({ ...formFields, cost: e.target.value })} placeholder="e.g. 1999" />
                </label>

                <label className="field-control">
                  <span>Tax / GST</span>
                  <input type="number" min="0" value={formFields.tax} onChange={(e) => setFormFields({ ...formFields, tax: e.target.value })} placeholder="e.g. 360" />
                </label>

                {/* Dates */}
                <label className="field-control">
                  <span>Purchase Date</span>
                  <input type="date" value={formFields.purchaseDate} onChange={(e) => setFormFields({ ...formFields, purchaseDate: e.target.value })} />
                </label>

                <label className="field-control">
                  <span>Renewal Date *</span>
                  <input type="date" required value={formFields.renewalDate} onChange={(e) => setFormFields({ ...formFields, renewalDate: e.target.value })} />
                </label>

                {/* Ownership */}
                <label className="field-control">
                  <span>Owner Name</span>
                  <select value={formFields.owner} onChange={(e) => setFormFields({ ...formFields, owner: e.target.value })}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.fields.name}>{emp.fields.name}</option>)}
                  </select>
                </label>

                <label className="field-control">
                  <span>Department</span>
                  <select value={formFields.department} onChange={(e) => setFormFields({ ...formFields, department: e.target.value })}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </label>

                {/* Payment */}
                <label className="field-control">
                  <span>Payment Method</span>
                  <input type="text" value={formFields.paymentMethod} onChange={(e) => setFormFields({ ...formFields, paymentMethod: e.target.value })} placeholder="e.g. ICICI Credit Card" />
                </label>

                <label className="field-control">
                  <span>Billing Email</span>
                  <input type="email" value={formFields.billingEmail} onChange={(e) => setFormFields({ ...formFields, billingEmail: e.target.value })} placeholder="e.g. finance@enxt.co" />
                </label>

                <label className="field-control">
                  <span>Status</span>
                  <select value={formFields.status} onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>

                <label className="field-control" style={{ gridColumn: "span 2" }}>
                  <span>Description & Usage Notes</span>
                  <textarea value={formFields.description} onChange={(e) => setFormFields({ ...formFields, description: e.target.value })} placeholder="Provide targets or objectives for this service..." style={{ minHeight: "60px" }} />
                </label>

              </div>

              <div className="editor-footer">
                <div className="editor-actions">
                  <button className="secondary-button" type="button" onClick={() => { setIsAddingNew(false); setIsEditing(null); }}>Cancel</button>
                  <button className="primary-button" type="submit">
                    {isAddingNew ? "Add Subscription" : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
