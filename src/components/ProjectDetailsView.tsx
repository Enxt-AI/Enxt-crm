"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  X, Check, Plus, Search, FileText, Calendar, Trash2, Edit2, Play, Users, Clock,
  Briefcase, Activity, AlertCircle, BarChart2, Shield, Settings, Download, ExternalLink,
  ChevronRight, FileCode, FileSpreadsheet, Send, TrendingUp, Info, List, CheckSquare
} from "lucide-react";
import type { BrainDocument } from "../lib/types";

interface ProjectDetailsViewProps {
  project: BrainDocument;
  employees: any[];
  onUpdateProject: (projectId: string, fields: Record<string, string>) => void;
  onViewDocument: (doc: any) => void;
  onBack: () => void;
  allTasks?: any[];
}

async function uploadFileDirectlyToGoogleDrive(file: File): Promise<{
  success: boolean;
  fileId: string;
  fileName: string;
  webViewLink: string;
  mocked?: boolean;
}> {
  const tokenRes = await fetch("/api/documents/upload");
  if (!tokenRes.ok) {
    throw new Error(`Token vendor returned status ${tokenRes.status}`);
  }
  const tokenData = await tokenRes.json();

  if (tokenData.mocked) {
    console.log("Using client-side sandbox simulation for file upload");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockFileId = `sim-drive-${Date.now()}`;
    return {
      success: true,
      fileId: mockFileId,
      fileName: file.name,
      webViewLink: `https://drive.google.com/file/d/${mockFileId}/view?usp=drivesdk`,
      mocked: true
    };
  }

  const { accessToken, folderId } = tokenData;
  if (!accessToken) {
    throw new Error("Google Access Token is empty");
  }

  const metadata: any = {
    name: file.name
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata);
  const mediaPartHeader = `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const blob = new Blob([
    delimiter,
    metadataPart,
    delimiter,
    mediaPartHeader,
    file,
    closeDelimiter
  ], { type: `multipart/related; boundary=${boundary}` });

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: blob
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Upload API Error: ${uploadRes.status} ${errText}`);
  }

  const driveData = await uploadRes.json();

  try {
    const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${driveData.id}/permissions?supportsAllDrives=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
    if (!permRes.ok) {
      console.warn("Failed to set file permission:", await permRes.text());
    }
  } catch (permErr) {
    console.warn("Failed to set open read permission for Drive file:", permErr);
  }

  return {
    success: true,
    fileId: driveData.id,
    fileName: driveData.name,
    webViewLink: driveData.webViewLink
  };
}

export default function ProjectDetailsView({
  project,
  employees,
  onUpdateProject,
  onViewDocument,
  onBack,
  allTasks = []
}: ProjectDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "meetings" | "team" | "analytics" | "risks" | "notes">("overview");

  // Local states for sub-features
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("All");
  const [docSort, setDocSort] = useState("name-asc");
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Meetings
  const [meetingFilter, setMeetingFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);

  // Risks
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);

  // Team Member Details Modal
  const [selectedTeamMember, setSelectedTeamMember] = useState<any | null>(null);

  // Notes state
  const [notesText, setNotesText] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper utility to safely convert field to text
  const asText = (doc: BrainDocument, key: string) => String(doc.fields?.[key] ?? "");
  const asNumber = (doc: BrainDocument, key: string) => Number(doc.fields?.[key] ?? 0);

  // -------------------------------------------------------------
  // Load Project-Specific Data from Fields (Fallback to Mock Data)
  // -------------------------------------------------------------

  // Parse meetings
  const meetings = useMemo(() => {
    const raw = project.fields.meetings;
    if (raw && typeof raw === "string") {
      try { return JSON.parse(raw); } catch (_) {}
    }
    // Mock default meetings if none exist
    return [
      {
        id: `meet-1`,
        title: "Kickoff & Requirement Alignment",
        date: "2026-06-15",
        time: "11:00 AM",
        participants: [project.fields.owner || "Rohan Iyer", "YUG", "Alok"],
        summary: "Aligned project goals, milestones, and deliverable schedules. Defined integration parameters.",
        actionItems: ["Finalize architecture roadmap (Yug)", "Set up GitHub repo (Alok)"],
        nextMeetingDate: "2026-06-22"
      },
      {
        id: `meet-2`,
        title: "Sprint 1 Technical Review",
        date: "2026-07-10",
        time: "02:30 PM",
        participants: [project.fields.owner || "Rohan Iyer", "YUG"],
        summary: "Reviewed initial retrieval schema and staging pipelines. Identified latency bottlenecks in API loops.",
        actionItems: ["Optimize vector store indexing (Yug)"],
        nextMeetingDate: "2026-07-24"
      }
    ];
  }, [project.fields.meetings]);

  // Parse risks
  const risks = useMemo(() => {
    const raw = project.fields.risks;
    if (raw && typeof raw === "string") {
      try { return JSON.parse(raw); } catch (_) {}
    }
    return [
      {
        id: "risk-1",
        title: "Staging Pipeline Latency",
        description: "Large embeddings matching queries currently take >800ms. Optimization required.",
        priority: "High",
        owner: "Yug Jain",
        resolution: "Introduce server-side cache and index optimization.",
        status: "Active"
      },
      {
        id: "risk-2",
        title: "Client Approvals Backlog",
        description: "Approval for external ingestion policies has been delayed, blocking final production setup.",
        priority: "Critical",
        owner: project.fields.owner || "Rohan Iyer",
        resolution: "Follow up directly on weekly leadership call.",
        status: "Active"
      }
    ];
  }, [project.fields.risks]);

  // Parse custom documents
  const customDocs = useMemo(() => {
    const raw = project.fields.customDocs;
    if (raw) {
      if (typeof raw === "string") {
        try { return JSON.parse(raw); } catch (_) {}
      } else if (Array.isArray(raw)) {
        return raw;
      }
    }
    return [];
  }, [project.fields.customDocs]);

  // Load project tasks
  const projectTasks = useMemo(() => {
    const projectTitle = String(project.title ?? "").toLowerCase();
    return allTasks.filter((t: any) => {
      const taskTitle = String(t.title ?? "").toLowerCase();
      const taskDesc = String(t.description ?? "").toLowerCase();
      return (
        taskTitle.includes(projectTitle) ||
        projectTitle.includes(taskTitle) ||
        taskDesc.includes(projectTitle)
      );
    });
  }, [allTasks, project.title]);

  // Load actual assigned team members for this project's tasks
  const projectTeam = useMemo(() => {
    const assignedIds = new Set(projectTasks.flatMap((t: any) => t.assignedEmployeeIds || []));
    const assignedMembers = employees.filter((emp: any) => assignedIds.has(emp.id));
    if (assignedMembers.length === 0) {
      return employees
        .filter((emp: any) => {
          const status = emp.fields?.status || emp.status;
          return String(status).toLowerCase() === "active";
        })
        .slice(0, 3);
    }
    return assignedMembers;
  }, [projectTasks, employees]);

  // Load notes
  useEffect(() => {
    setNotesText(String(project.fields.notes || project.body || ""));
  }, [project.id]);

  // -------------------------------------------------------------
  // Auto-Save Notes
  // -------------------------------------------------------------
  const handleNotesChange = (text: string) => {
    setNotesText(text);
    setAutoSaveStatus("saving...");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      onUpdateProject(project.id, { notes: text });
      setAutoSaveStatus("saved");
    }, 1000);
  };

  // -------------------------------------------------------------
  // Calculations for Health, Donut Progress
  // -------------------------------------------------------------
  const taskStats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter((t: any) => t.status === "Completed").length;
    const pending = projectTasks.filter((t: any) => t.status === "Pending").length;
    const blocked = projectTasks.filter((t: any) => t.status === "Blocked").length;
    const inProgress = projectTasks.filter((t: any) => t.status === "In Progress").length;

    // Days remaining logic
    const due = new Date(String(project.fields.dueDate || new Date().toISOString()));
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Calculate Completion
    const calculatedProgress = total > 0 ? Math.round((completed / total) * 100) : Number(project.fields.progress || 0);

    // Calculate dynamic health
    let calculatedHealth = "Green";
    const overdueTasks = projectTasks.filter((t: any) => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < today).length;

    if (overdueTasks > 0 || blocked > 1 || (daysRemaining < 7 && calculatedProgress < 50)) {
      calculatedHealth = "Red";
    } else if (blocked > 0 || overdueTasks > 0 || (daysRemaining < 14 && calculatedProgress < 75)) {
      calculatedHealth = "Amber";
    }

    return {
      total,
      completed,
      pending,
      blocked,
      inProgress,
      daysRemaining,
      progress: calculatedProgress,
      health: calculatedHealth,
      overdue: overdueTasks
    };
  }, [projectTasks, project.fields.progress, project.fields.dueDate]);

  // -------------------------------------------------------------
  // AI Summary Generator
  // -------------------------------------------------------------
  const [aiSummary, setAiSummary] = useState<string>("");
  const [generatingAi, setGeneratingAi] = useState(false);

  const triggerGenerateAi = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      const summaryText = `Project "${project.title}" is currently ${taskStats.progress}% complete. Development is in the "${project.fields.phase}" phase with overall health rated as "${taskStats.health}". The team is managing ${taskStats.total} tasks (${taskStats.completed} completed, ${taskStats.blocked} blocked, and ${taskStats.overdue} overdue). Key milestones upcoming on ${project.fields.dueDate || "N/A"}. Recent risks include client policy verification backlogs, with mitigation strategies active. Expecting project completion within target timeline.`;
      setAiSummary(summaryText);
      setGeneratingAi(false);
    }, 1500);
  };

  useEffect(() => {
    triggerGenerateAi();
  }, [project.id]);

  // -------------------------------------------------------------
  // Filtered & Sorted Documents
  // -------------------------------------------------------------
  const filteredDocs = useMemo(() => {
    const list = [...customDocs];
    return list
      .filter((d: any) => {
        const labelText = String(d.label || "").toLowerCase();
        const fileText = String(d.fileName || "").toLowerCase();
        const matchesQuery = labelText.includes(docSearch.toLowerCase()) || fileText.includes(docSearch.toLowerCase());
        const matchesType = docTypeFilter === "All" || (d.fileName && d.fileName.split(".").pop()?.toUpperCase() === docTypeFilter);
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        if (docSort === "name-asc") return String(a.label || "").localeCompare(String(b.label || ""));
        if (docSort === "name-desc") return String(b.label || "").localeCompare(String(a.label || ""));
        return 0;
      });
  }, [customDocs, docSearch, docTypeFilter, docSort]);

  // Document types present
  const docTypes = useMemo<string[]>(() => {
    const types = customDocs.map((d: any) => d.fileName ? d.fileName.split(".").pop()?.toUpperCase() : "").filter(Boolean);
    return Array.from(new Set(types)) as string[];
  }, [customDocs]);

  // -------------------------------------------------------------
  // Document Operations
  // -------------------------------------------------------------
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleAddNewDocument = async (name: string, file: File) => {
    setIsUploadingDoc(true);
    try {
      const data = await uploadFileDirectlyToGoogleDrive(file);
      if (data.success) {
        const newDoc = {
          id: `custom-${Date.now()}`,
          label: name,
          fileName: data.fileName,
          fileUrl: data.webViewLink,
          size: `${Math.round(file.size / 1024)} KB`,
          date: new Date().toISOString().slice(0, 10),
          version: "v1.0",
          author: project.fields.owner || "Rohan Iyer"
        };
        onUpdateProject(project.id, {
          customDocs: JSON.stringify([...customDocs, newDoc])
        });
        setShowDocUploadModal(false);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    const updated = customDocs.filter((d: any) => d.id !== docId);
    onUpdateProject(project.id, {
      customDocs: JSON.stringify(updated)
    });
  };

  // -------------------------------------------------------------
  // Meeting Operations
  // -------------------------------------------------------------
  const handleScheduleMeeting = (title: string, date: string, time: string, summary: string) => {
    const newMeeting = {
      id: `meet-${Date.now()}`,
      title,
      date,
      time,
      participants: [project.fields.owner || "Rohan Iyer", "YUG", "Alok"],
      summary,
      actionItems: ["Proceed with milestones"],
      nextMeetingDate: date
    };
    onUpdateProject(project.id, {
      meetings: JSON.stringify([...meetings, newMeeting])
    });
    setShowScheduleMeetingModal(false);
  };

  // -------------------------------------------------------------
  // Risk Operations
  // -------------------------------------------------------------
  const handleAddRisk = (title: string, description: string, priority: string) => {
    const newRisk = {
      id: `risk-${Date.now()}`,
      title,
      description,
      priority,
      owner: project.fields.owner || "Rohan Iyer",
      resolution: "Pending team review",
      status: "Active"
    };
    onUpdateProject(project.id, {
      risks: JSON.stringify([...risks, newRisk])
    });
    setShowAddRiskModal(false);
  };

  // -------------------------------------------------------------
  // Exporters (PDF, CSV, Excel)
  // -------------------------------------------------------------
  const exportToCSV = () => {
    const rows = [
      ["Project Title", project.title],
      ["Client", project.fields.client || "N/A"],
      ["Phase", project.fields.phase || "N/A"],
      ["Health", taskStats.health],
      ["Progress", `${taskStats.progress}%`],
      ["Due Date", project.fields.dueDate || "N/A"],
      [],
      ["Tasks Details"],
      ["Task Title", "Status", "Due Date"],
      ...projectTasks.map((t: any) => [t.title, t.status, t.dueDate || "N/A"]),
      [],
      ["Risks Log"],
      ["Risk Title", "Description", "Priority", "Owner"],
      ...risks.map((r: any) => [r.title, r.description, r.priority, r.owner]),
      [],
      ["Meetings List"],
      ["Meeting Title", "Date", "Summary"],
      ...meetings.map((m: any) => [m.title, m.date, m.summary])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map((e: any) => e.map((val: any) => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project.title.replace(/\s+/g, "_")}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Generate simple spreadsheet styled HTML table as Excel file
    let tableHtml = `<table border="1">
      <tr><th colspan="3" style="background:#16784f; color:#fff; font-size:16px;">${project.title} Report</th></tr>
      <tr><td><strong>Client</strong></td><td colspan="2">${project.fields.client || "N/A"}</td></tr>
      <tr><td><strong>Health</strong></td><td colspan="2">${taskStats.health}</td></tr>
      <tr><td><strong>Progress</strong></td><td colspan="2">${taskStats.progress}%</td></tr>
      <tr><td><strong>Phase</strong></td><td colspan="2">${project.fields.phase || "N/A"}</td></tr>
      <tr><td colspan="3">&nbsp;</td></tr>
      <tr><th colspan="3" style="background:#f4f7f0;">Team Tasks</th></tr>
      <tr><th>Task</th><th>Status</th><th>Due</th></tr>`;

    projectTasks.forEach((t: any) => {
      tableHtml += `<tr><td>${t.title}</td><td>${t.status}</td><td>${t.dueDate || "N/A"}</td></tr>`;
    });

    tableHtml += `<tr><td colspan="3">&nbsp;</td></tr>
      <tr><th colspan="3" style="background:#f4f7f0;">Risks Log</th></tr>
      <tr><th>Risk Title</th><th>Priority</th><th>Owner</th></tr>`;

    risks.forEach((r: any) => {
      tableHtml += `<tr><td>${r.title}</td><td>${r.priority}</td><td>${r.owner}</td></tr>`;
    });

    tableHtml += `</table>`;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.title.replace(/\s+/g, "_")}_report.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrintPDF = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // Custom SVG donut completion chart dimensions
  // -------------------------------------------------------------
  const donutStrokeDash = useMemo(() => {
    const radius = 50;
    const circ = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(taskStats.progress, 0), 100);
    const strokeDashoffset = circ - (progress / 100) * circ;
    return { strokeDashoffset, circ };
  }, [taskStats.progress]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* HEADER SECTION */}
      <header className="project-detail-header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "var(--shadow)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onBack}
            className="secondary-button"
            style={{ minHeight: "38px", padding: "0 14px", borderRadius: "8px" }}
          >
            ← Back
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="eyebrow" style={{ margin: 0 }}>{asText(project, "client") || "Client"}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>•</span>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>{asText(project, "phase")}</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", margin: "4px 0 0" }}>{project.title}</h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            background: taskStats.health === "Green" ? "var(--green-soft)" : taskStats.health === "Amber" ? "var(--amber-soft)" : "#fef2f2",
            color: taskStats.health === "Green" ? "var(--green)" : taskStats.health === "Amber" ? "var(--amber)" : "var(--red)",
            borderRadius: "999px",
            padding: "5px 12px",
            fontSize: "0.78rem",
            fontWeight: 700,
            textTransform: "uppercase"
          }}>
            {taskStats.health} Health
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500 }}>
            Due {new Date(String(project.fields.dueDate || new Date().toISOString())).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>

          <div style={{ display: "flex", gap: "6px" }}>
            <button className="icon-button" onClick={exportToCSV} title="Export CSV" style={{ height: "38px", width: "38px" }}>
              <FileSpreadsheet size={15} />
            </button>
            <button className="icon-button" onClick={exportToExcel} title="Export Excel" style={{ height: "38px", width: "38px" }}>
              <Download size={15} />
            </button>
            <button className="icon-button" onClick={triggerPrintPDF} title="Print Report" style={{ height: "38px", width: "38px" }}>
              <FileText size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: NAVIGATION AND TAB PANELS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* TAB BAR NAVIGATION */}
          <nav style={{
            display: "flex",
            gap: "4px",
            background: "rgba(0, 0, 0, 0.03)",
            padding: "4px",
            borderRadius: "12px",
            border: "1px solid var(--line)",
            alignSelf: "flex-start"
          }}>
            {([
              { id: "overview", label: "Overview", icon: Activity },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "meetings", label: "Meetings", icon: Calendar },
              { id: "team", label: "Team", icon: Users },
              { id: "analytics", label: "Analytics", icon: BarChart2 },
              { id: "risks", label: "Risks", icon: AlertCircle },
              { id: "notes", label: "Notes", icon: CheckSquare }
            ] as const).map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isSelected ? "var(--panel)" : "transparent",
                    color: isSelected ? "var(--ink)" : "var(--muted)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* TAB PANEL 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                
                {/* DONUT COMPLETION CARD */}
                <div className="panel" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px" }}>
                  <div style={{ position: "relative", width: "110px", height: "110px" }}>
                    <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--line)" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="transparent"
                        stroke="var(--green)"
                        strokeWidth="8"
                        strokeDasharray={donutStrokeDash.circ}
                        strokeDashoffset={donutStrokeDash.strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease" }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                        {taskStats.progress}%
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginTop: "2px" }}>
                        Done
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Progress Overview</h4>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
                      {taskStats.completed} / {taskStats.total} Tasks Completed
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {taskStats.daysRemaining} days remaining till due date
                    </span>
                  </div>
                </div>

                {/* KPIS LIST CARD */}
                <div className="panel" style={{ padding: "20px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Project Metrics</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Active Tasks</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--ink)", marginTop: "2px" }}>
                        {taskStats.inProgress + taskStats.pending}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Blocked Tasks</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "#ef4444", marginTop: "2px" }}>
                        {taskStats.blocked}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Documents</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--ink)", marginTop: "2px" }}>
                        {customDocs.length}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Meetings</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--ink)", marginTop: "2px" }}>
                        {meetings.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIMELINE & DEADLINES */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
                
                {/* TIMELINE PANEL */}
                <div className="panel" style={{ padding: "20px" }}>
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Activity size={16} style={{ color: "var(--green)" }} />
                    <span>Project Timeline</span>
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", paddingLeft: "16px" }}>
                    <div style={{ position: "absolute", left: "6px", top: "4px", bottom: "4px", width: "2px", background: "var(--line)" }} />
                    
                    {[
                      { icon: FileText, user: "Rohan Iyer", action: "uploaded leave policy template", time: "2 hours ago" },
                      { icon: Calendar, user: "Alok", action: "scheduled Technical Alignment meeting", time: "Yesterday" },
                      { icon: CheckSquare, user: "Yug Jain", action: "completed API interface setup task", time: "3 days ago" },
                      { icon: AlertCircle, user: "System", action: "flagged Staging Pipeline Latency risk", time: "5 days ago" }
                    ].map((item: any, idx: number) => {
                      const TimelineIcon = item.icon;
                      return (
                        <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", position: "relative" }}>
                          <span style={{
                            position: "absolute",
                            left: "-16px",
                            top: "2px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "var(--green)",
                            border: "2px solid #fff"
                          }} />
                          <div style={{
                            background: "var(--green-soft)",
                            color: "var(--green)",
                            padding: "4px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <TimelineIcon size={12} />
                          </div>
                          <div>
                            <span style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600 }}>{item.user} </span>
                            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{item.action}</span>
                            <small style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)", marginTop: "2px" }}>{item.time}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* UPCOMING DEADLINES PANEL */}
                <div className="panel" style={{ padding: "20px" }}>
                  <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Clock size={16} style={{ color: "var(--green)" }} />
                    <span>Upcoming Deadlines</span>
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {projectTasks.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.85rem", padding: "12px" }}>
                        No upcoming tasks.
                      </p>
                    ) : (
                      projectTasks.slice(0, 4).map((task: any) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
                        return (
                          <div key={task.id} style={{
                            background: "var(--panel-soft)",
                            border: "1px solid var(--line)",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <div>
                              <strong style={{ fontSize: "0.85rem", color: "var(--ink)", display: "block" }}>{task.title}</strong>
                              <span style={{
                                fontSize: "0.75rem",
                                color: isOverdue ? "var(--red)" : "var(--muted)",
                                fontWeight: isOverdue ? 700 : 500
                              }}>
                                {isOverdue ? "OVERDUE • " : ""}Due: {task.dueDate || "N/A"}
                              </span>
                            </div>
                            <span style={{
                              background: task.status === "Blocked" ? "#fee2e2" : task.status === "In Progress" ? "var(--green-soft)" : "rgba(0,0,0,0.05)",
                              color: task.status === "Blocked" ? "var(--red)" : task.status === "In Progress" ? "var(--green)" : "var(--muted)",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              fontSize: "0.72rem",
                              fontWeight: 700
                            }}>
                              {task.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB PANEL 2: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                
                {/* Search / Filter Document Inputs */}
                <div style={{ display: "flex", gap: "10px", flexGrow: 1, maxWidth: "500px" }}>
                  <div className="filter-search" style={{ flexGrow: 1, minHeight: "36px" }}>
                    <Search size={14} />
                    <input
                      placeholder="Search documents..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                  <select
                    value={docTypeFilter}
                    onChange={(e) => setDocTypeFilter(e.target.value)}
                    style={{
                      padding: "0 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      fontSize: "0.8rem",
                      background: "white"
                    }}
                  >
                    <option value="All">All Types</option>
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowDocUploadModal(true)}
                  style={{ minHeight: "36px", padding: "0 14px", borderRadius: "8px", fontSize: "0.85rem" }}
                >
                  <Plus size={14} style={{ marginRight: "6px" }} />
                  Upload New Document
                </button>
              </div>

              {/* Document List Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Version</th>
                      <th>Uploaded By</th>
                      <th>Date</th>
                      <th>Size</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "30px" }}>
                          No documents match filters. Click upload to add.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => {
                        const ext = doc.fileName ? doc.fileName.split(".").pop()?.toLowerCase() : "pdf";
                        return (
                          <tr key={doc.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <FileText size={16} style={{ color: "var(--green)" }} />
                                <div>
                                  <strong style={{ fontSize: "0.85rem", color: "var(--ink)", display: "block" }}>{doc.label}</strong>
                                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{doc.fileName}</span>
                                </div>
                              </div>
                            </td>
                            <td><span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{doc.version || "v1.0"}</span></td>
                            <td><span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{doc.author || "Founder Office"}</span></td>
                            <td><span style={{ fontSize: "0.82rem", color: "var(--ink)" }}>{doc.date || "N/A"}</span></td>
                            <td><span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{doc.size || "120 KB"}</span></td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                  <button
                                    className="secondary-button"
                                    onClick={() => onViewDocument({
                                      employeeName: project.title,
                                      label: doc.label,
                                      status: "Available",
                                      value: doc.fileName || `${doc.label}.pdf`,
                                      url: doc.fileUrl
                                    })}
                                    style={{ minHeight: "28px", padding: "0 8px", fontSize: "0.75rem" }}
                                  >
                                    View
                                  </button>
                                <button
                                  className="icon-button"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  style={{ height: "28px", width: "28px", padding: 0 }}
                                  title="Delete Document"
                                >
                                  <Trash2 size={13} style={{ color: "var(--red)" }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB PANEL 3: MEETINGS */}
          {activeTab === "meetings" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <select
                  value={meetingFilter}
                  onChange={(e) => setMeetingFilter(e.target.value as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    fontSize: "0.8rem",
                    background: "white"
                  }}
                >
                  <option value="all">All History</option>
                  <option value="today">Meetings Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <button
                  className="primary-button"
                  onClick={() => setShowScheduleMeetingModal(true)}
                  style={{ minHeight: "36px", padding: "0 14px", borderRadius: "8px", fontSize: "0.85rem" }}
                >
                  ➕ Schedule Meeting
                </button>
              </div>

              {/* Timeline of Meetings */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {meetings.map((meeting: any) => (
                  <div
                    key={meeting.id}
                    style={{
                      background: "var(--panel-soft)",
                      border: "1px solid var(--line)",
                      borderRadius: "12px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)", fontWeight: 700 }}>
                          {meeting.title}
                        </h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                          {meeting.date} at {meeting.time}
                        </span>
                      </div>
                      <span style={{
                        background: "rgba(0,0,0,0.05)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        height: "fit-content",
                        fontWeight: 600
                      }}>
                        Participants: {meeting.participants.join(", ")}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink)", lineHeight: "1.4" }}>
                      <strong>Summary:</strong> {meeting.summary}
                    </p>

                    {meeting.actionItems && meeting.actionItems.length > 0 && (
                      <div style={{
                        borderTop: "1px solid var(--line)",
                        paddingTop: "8px",
                        marginTop: "4px"
                      }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                          Action Items:
                        </span>
                        <ul style={{ margin: "4px 0 0", paddingLeft: "16px", fontSize: "0.8" + "rem", color: "var(--ink)" }}>
                          {meeting.actionItems.map((item: any, idx: number) => <li key={idx}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB PANEL 4: TEAM */}
          {activeTab === "team" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                
                {projectTeam.map((member: any) => {
                    const name = member.fields?.name || member.title || "Team Member";
                    const isYug = name.toLowerCase().includes("yug");
                    const currentTask = isYug ? "Embeddings indexing & scaling" : "Staging layout & UI updates";
                    
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedTeamMember(member)}
                        style={{
                          background: "var(--panel-soft)",
                          border: "1px solid var(--line)",
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: "pointer",
                          display: "flex",
                          gap: "12px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--accent)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          flexShrink: 0
                        }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ fontSize: "0.88rem", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {name}
                            </strong>
                            <span style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: isYug ? "#f59e0b" : "#10b981", // Busy / Online
                              flexShrink: 0
                            }} />
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                            {member.fields?.role || "Developer"}
                          </span>
                          <span style={{
                            fontSize: "0.75rem",
                            color: "var(--ink)",
                            marginTop: "6px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            Task: {currentTask}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB PANEL 5: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
                
                {/* 1. Task Completion Progression (SVG Donut Stack) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase" }}>Velocity & Productivity</h4>
                  
                  <div style={{ display: "flex", justifyContent: "space-around", gap: "10px", marginTop: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--line)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--green)" strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - taskStats.progress / 100)}
                        />
                      </svg>
                      <span style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginTop: "6px" }}>{taskStats.progress}%</span>
                      <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Overall Done</small>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--line)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--teal)" strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * 0.28}
                        />
                      </svg>
                      <span style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, marginTop: "6px" }}>72%</span>
                      <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Sprint Progress</small>
                    </div>
                  </div>
                </div>

                {/* 2. Weekly Tasks Completed (Custom Bar Chart SVG) */}
                <div>
                  <h4 style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase" }}>Weekly Completed Tasks</h4>
                  
                  <svg width="100%" height="120" viewBox="0 0 300 120" style={{ overflow: "visible" }}>
                    {/* Grid lines */}
                    <line x1="0" y1="10" x2="300" y2="10" stroke="rgba(0,0,0,0.05)" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0,0,0,0.05)" />
                    <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(0,0,0,0.05)" />
                    <line x1="0" y1="110" x2="300" y2="110" stroke="var(--line)" />
                    
                    {/* Weekly bars (Mock Data) */}
                    {[
                      { week: "Wk 24", count: 2, height: 35 },
                      { week: "Wk 25", count: 4, height: 70 },
                      { week: "Wk 26", count: 3, height: 50 },
                      { week: "Wk 27", count: 6, height: 95 }
                    ].map((wk: any, i: number) => (
                      <g key={i} transform={`translate(${i * 70 + 35}, 0)`}>
                        <rect
                          x="0"
                          y={110 - wk.height}
                          width="24"
                          height={wk.height}
                          rx="4"
                          fill="var(--green)"
                          style={{ transition: "height 0.6s ease" }}
                        />
                        <text x="12" y="118" fill="var(--muted)" fontSize="9" textAnchor="middle">{wk.week}</text>
                        <text x="12" y={105 - wk.height} fill="var(--ink)" fontSize="10" fontWeight="700" textAnchor="middle">{wk.count}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Extra KPIs Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                borderTop: "1px solid var(--line)",
                paddingTop: "16px",
                marginTop: "16px"
              }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Avg Completion Time</span>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--ink)", marginTop: "2px" }}>4.2 Days</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Active Members</span>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--ink)", marginTop: "2px" }}>3 developers</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Meetings Held</span>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--ink)", marginTop: "2px" }}>{meetings.length}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB PANEL 6: RISKS */}
          {activeTab === "risks" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ink)", fontWeight: 700 }}>Risks and Blockers</h3>
                <button
                  className="primary-button"
                  onClick={() => setShowAddRiskModal(true)}
                  style={{ minHeight: "32px", padding: "0 12px", borderRadius: "8px", fontSize: "0.8rem" }}
                >
                  ➕ Add Risk Log
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {risks.map((risk: any) => {
                  const pColor =
                    risk.priority === "Critical" ? "var(--red)" :
                    risk.priority === "High" ? "var(--amber)" :
                    risk.priority === "Medium" ? "#f59e0b" : "var(--green)";
                  
                  return (
                    <div
                      key={risk.id}
                      style={{
                        background: "var(--panel-soft)",
                        border: "1px solid var(--line)",
                        borderRadius: "10px",
                        padding: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0, fontSize: "0.9rem", color: "var(--ink)", fontWeight: 700 }}>
                          {risk.title}
                        </h4>
                        <span style={{
                          background: `${pColor}20`,
                          color: pColor,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}>
                          {risk.priority}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: "1.4" }}>
                        {risk.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)", borderTop: "1px solid rgba(0,0,0,0.03)", paddingTop: "6px", marginTop: "4px" }}>
                        <span>Owner: <strong>{risk.owner}</strong></span>
                        <span>Resolution Strategy: {risk.resolution}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB PANEL 7: NOTES */}
          {activeTab === "notes" && (
            <div className="panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  Auto-saves project notes instantly to cloud
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={12} style={{ color: "var(--green)" }} />
                  {autoSaveStatus}
                </span>
              </div>
              <textarea
                value={notesText}
                onChange={(e) => handleNotesChange(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "360px",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  fontFamily: "inherit",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  color: "var(--ink)",
                  resize: "vertical",
                  outline: "none"
                }}
                placeholder="Write project objectives, details, deliverables, team action items..."
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI INSIGHTS CARD */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} style={{ color: "var(--green)" }} />
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>AI Project Insights</h3>
            </div>

            <div style={{
              background: "var(--green-soft)",
              border: "1px solid rgba(22, 120, 79, 0.15)",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "0.82rem",
              lineHeight: "1.5",
              color: "var(--green)"
            }}>
              {generatingAi ? "Analyzing project metrics..." : aiSummary}
            </div>

            <button
              onClick={triggerGenerateAi}
              disabled={generatingAi}
              className="primary-button"
              style={{
                width: "100%",
                minHeight: "34px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              ✨ Generate AI Summary
            </button>
          </div>
        </aside>

      </div>

      {/* -------------------------------------------------------------
      // MODALS / POPUPS SECTION
      // ------------------------------------------------------------- */}

      {/* 1. DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="document-viewer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">File Preview</p>
                <h3>{previewDoc.label}</h3>
              </div>
              <button className="icon-button" onClick={() => setPreviewDoc(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div className="document-preview-box" style={{ background: "var(--panel-soft)" }}>
              <FileText size={48} style={{ color: "var(--green)" }} />
              <strong style={{ display: "block", marginTop: "12px" }}>{previewDoc.fileName}</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Author: {previewDoc.author} • Date: {previewDoc.date}</span>
              
              <div style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "14px",
                width: "100%",
                textAlign: "left",
                fontSize: "0.82rem",
                color: "var(--ink)",
                lineHeight: "1.5"
              }}>
                [Preview Area] This project document is archived in safe local storage. Feel free to copy or edit details.
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <button className="secondary-button" onClick={() => setPreviewDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPLOAD DOCUMENT MODAL */}
      {showDocUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowDocUploadModal(false)}>
          <div className="document-viewer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="panel-heading">
              <h3>Upload Document Slot</h3>
              <button className="icon-button" onClick={() => setShowDocUploadModal(false)}>
                <X size={16} />
              </button>
            </div>            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const label = String(formData.get("label") || "");
              const fileInput = (e.currentTarget.elements.namedItem("file") as HTMLInputElement);
              const file = fileInput?.files?.[0];
              if (label && file) {
                await handleAddNewDocument(label, file);
              } else {
                alert("Please select a document label and choose a file!");
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <label className="field-control">
                <span>Document Label</span>
                <input name="label" placeholder="e.g. NDA, Client Proposal" required disabled={isUploadingDoc} />
              </label>

              <label className="field-control">
                <span>Select File</span>
                <input type="file" name="file" required disabled={isUploadingDoc} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" style={{
                  padding: "8px 10px",
                  lineHeight: "1.4"
                }} />
              </label>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" onClick={() => setShowDocUploadModal(false)} disabled={isUploadingDoc}>Cancel</button>
                <button type="submit" className="primary-button" disabled={isUploadingDoc}>
                  {isUploadingDoc ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE MEETING MODAL */}
      {showScheduleMeetingModal && (
        <div className="modal-backdrop" onClick={() => setShowScheduleMeetingModal(false)}>
          <div className="document-viewer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="panel-heading">
              <h3>Schedule Project Meeting</h3>
              <button className="icon-button" onClick={() => setShowScheduleMeetingModal(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = String(formData.get("title") || "");
              const date = String(formData.get("date") || "");
              const time = String(formData.get("time") || "");
              const summary = String(formData.get("summary") || "");
              if (title && date && time) {
                handleScheduleMeeting(title, date, time, summary);
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <label className="field-control">
                <span>Meeting Title</span>
                <input name="title" placeholder="e.g. Sprint Sync / Alignment" required />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="field-control">
                  <span>Date</span>
                  <input type="date" name="date" required />
                </label>
                <label className="field-control">
                  <span>Time</span>
                  <input type="time" name="time" required />
                </label>
              </div>

              <label className="field-control">
                <span>Objective Summary</span>
                <textarea name="summary" placeholder="Provide targets or meeting agenda..." style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)"
                }} required />
              </label>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" onClick={() => setShowScheduleMeetingModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD RISK MODAL */}
      {showAddRiskModal && (
        <div className="modal-backdrop" onClick={() => setShowAddRiskModal(false)}>
          <div className="document-viewer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="panel-heading">
              <h3>Log New Risk / Blocker</h3>
              <button className="icon-button" onClick={() => setShowAddRiskModal(false)}>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = String(formData.get("title") || "");
              const description = String(formData.get("description") || "");
              const priority = String(formData.get("priority") || "Medium");
              if (title && description) {
                handleAddRisk(title, description, priority);
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <label className="field-control">
                <span>Risk Title</span>
                <input name="title" placeholder="e.g. Scope Creep / Delay" required />
              </label>

              <label className="field-control">
                <span>Priority Level</span>
                <select name="priority">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>

              <label className="field-control">
                <span>Description & Impact</span>
                <textarea name="description" placeholder="Impact on milestones, resource constraints..." style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)"
                }} required />
              </label>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddRiskModal(false)}>Cancel</button>
                <button type="submit" className="primary-button">Add Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TEAM MEMBER DETAIL MODAL */}
      {selectedTeamMember && (
        <div className="modal-backdrop" onClick={() => setSelectedTeamMember(null)}>
          <div className="document-viewer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{selectedTeamMember.fields?.role || "Developer"}</p>
                <h3>{selectedTeamMember.fields?.name || selectedTeamMember.title}</h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedTeamMember(null)}>
                <X size={16} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                background: "var(--panel-soft)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "12px"
              }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Assigned Project Tasks
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                  {projectTasks.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                      <span>{t.title}</span>
                      <strong style={{
                        color: t.status === "Completed" ? "var(--green)" : t.status === "Blocked" ? "var(--red)" : "var(--amber)"
                      }}>{t.status}</strong>
                    </div>
                  ))}
                  {projectTasks.length === 0 && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No tasks currently.</span>}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Online Status
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--ink)" }}>
                  🟢 Active & Online (Staging Dashboard interaction tracked)
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
              <button className="secondary-button" onClick={() => setSelectedTeamMember(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
