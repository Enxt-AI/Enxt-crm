import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Pencil,
  Trash2,
  Check,
  CalendarDays,
  ListTodo
} from "lucide-react";
import type { BrainDocument } from "../lib/types";

// Helper utility to safely convert field to text/number
const asText = (doc: BrainDocument, key: string) => String(doc.fields?.[key] ?? "");
const asNumber = (doc: BrainDocument, key: string) => Number(doc.fields?.[key] ?? 0);

// Robust date normalizer that handles multiple formats like DD/MM/YY, DD/MM/YYYY, etc.
function parseToISODate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const clean = dateStr.trim();
  if (clean.toLowerCase() === "na" || clean.toLowerCase() === "tbd" || clean.toLowerCase() === "missing" || !clean) {
    return null;
  }

  // Check if it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Parse slashes e.g., 18/7/26 or 18/07/2026 or 2026/07/18
  const slashParts = clean.split("/");
  if (slashParts.length === 3) {
    let day = parseInt(slashParts[0], 10);
    let month = parseInt(slashParts[1], 10);
    let year = parseInt(slashParts[2], 10);

    // YYYY/MM/DD
    if (slashParts[0].length === 4) {
      year = parseInt(slashParts[0], 10);
      month = parseInt(slashParts[1], 10);
      day = parseInt(slashParts[2], 10);
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      if (year < 100) {
        year += 2000;
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Parse dashes e.g., 18-7-26 or 18-07-2026
  const dashParts = clean.split("-");
  if (dashParts.length === 3) {
    let day = parseInt(dashParts[0], 10);
    let month = parseInt(dashParts[1], 10);
    let year = parseInt(dashParts[2], 10);

    // YYYY-MM-DD (already covered above, but handles other orders like DD-MM-YYYY)
    if (dashParts[0].length === 4) {
      year = parseInt(dashParts[0], 10);
      month = parseInt(dashParts[1], 10);
      day = parseInt(dashParts[2], 10);
    }

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      if (year < 100) {
        year += 2000;
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Native parse fallback
  try {
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  } catch (_) {}

  return null;
}

function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface ProjectCalendarViewProps {
  projects: BrainDocument[];
  leads: BrainDocument[];
  employees: BrainDocument[];
  allTasks?: any[];
  onUpdateProject: (projectId: string, fields: Record<string, any>) => void;
  onUpdateLead: (leadId: string, fields: Record<string, any>) => void;
  onClose: () => void;
  onViewProject: (projectId: string) => void;
  onEditLead?: (lead: BrainDocument) => void;
}

export default function ProjectCalendarView({
  projects,
  leads,
  employees,
  allTasks = [],
  onUpdateProject,
  onUpdateLead,
  onClose,
  onViewProject,
  onEditLead
}: ProjectCalendarViewProps) {
  // Calendar Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [clientFilter, setClientFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Selected Project / Side Panel Drawer
  const [selectedProject, setSelectedProject] = useState<BrainDocument | null>(null);

  // Add Event Modal
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    projectId: "",
    type: "meeting", // meeting, milestone, deadline, reminder
    title: "",
    date: getLocalDateString(new Date()),
    time: "10:00",
    summary: ""
  });

  // Drag & Drop Confirmation
  const [draggedProject, setDraggedProject] = useState<BrainDocument | null>(null);
  const [draggedMeeting, setDraggedMeeting] = useState<{ projectId: string; meetingId: string; title: string } | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Get current year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Color Coding Legend / Map
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    "Green": { bg: "#e6f4ea", text: "#137333", label: "On Track" },
    "Amber": { bg: "#fef7e0", text: "#b06000", label: "At Risk" },
    "Red": { bg: "#fce8e6", text: "#c5221f", label: "Delayed" },
    "Meeting": { bg: "#e8f0fe", text: "#1a73e8", label: "Meeting" },
    "Milestone": { bg: "#f3e8fd", text: "#8ab4f8", label: "Milestone" },
    "Completed": { bg: "#f1f3f4", text: "#5f6368", label: "Completed" },
    "Old Leads": { bg: "#f1f3f4", text: "#5f6368", label: "Old Leads" },
    "Contacts": { bg: "#f3e8fd", text: "#9333ea", label: "Contacts" },
    "Proposal": { bg: "#fef7e0", text: "#b06000", label: "Proposal" },
    "Project Started": { bg: "#e8f0fe", text: "#1a73e8", label: "Project Started" }
  };

  // 1. EXTRACT ALL EVENTS (Deadlines, Meetings, Milestones)
  const allEvents = useMemo(() => {
    const list: any[] = [];
    
    // (a) Process Project Documents
    projects.forEach((proj) => {
      const dueDate = asText(proj, "dueDate");
      const parsedDue = parseToISODate(dueDate);
      if (parsedDue) {
        list.push({
          id: `${proj.id}-deadline`,
          projectId: proj.id,
          type: "deadline",
          title: `🏁 ${proj.title} Deadline`,
          date: parsedDue,
          time: "18:00",
          color: proj.fields.health === "Green" ? "#137333" : proj.fields.health === "Amber" ? "#b06000" : "#c5221f",
          project: proj
        });
      }

      const rawMeetings = proj.fields.meetings;
      if (rawMeetings && typeof rawMeetings === "string") {
        try {
          const meetingsList = JSON.parse(rawMeetings);
          if (Array.isArray(meetingsList)) {
            meetingsList.forEach((m: any) => {
              list.push({
                id: m.id || `${proj.id}-meeting-${m.date}-${m.time}`,
                projectId: proj.id,
                type: "meeting",
                title: `👥 ${m.title} (Meeting)`,
                date: m.date,
                time: m.time || "10:00",
                color: "#1a73e8", // Blue
                project: proj,
                originalMeeting: m
              });
            });
          }
        } catch (_) {}
      }

      const rawMilestones = proj.fields.milestones;
      if (rawMilestones && typeof rawMilestones === "string") {
        try {
          const milestonesList = JSON.parse(rawMilestones);
          if (Array.isArray(milestonesList)) {
            milestonesList.forEach((ms: any) => {
              list.push({
                id: ms.id || `${proj.id}-milestone-${ms.date}`,
                projectId: proj.id,
                type: "milestone",
                title: `🏆 ${ms.title}`,
                date: ms.date,
                time: ms.time || "12:00",
                color: "#9333ea", // Purple
                project: proj,
                originalMilestone: ms
              });
            });
          }
        } catch (_) {}
      }
    });

    // (b) Process CRM Leads (projects of the CRM model)
    leads.forEach((lead) => {
      const deadline = asText(lead, "deadline");
      const parsedDeadline = parseToISODate(deadline);
      if (parsedDeadline) {
        const companyName = asText(lead, "company") || lead.title;
        const projDetails = asText(lead, "projectDetails") || "CRM Lead Project";
        const stage = asText(lead, "stage");
        
        // Color coding based on stage
        let color = "#5f6368"; // Grey for old leads
        if (stage === "Completed") color = "#137333"; // Green
        else if (stage === "Project Started") color = "#1a73e8"; // Blue
        else if (stage === "Proposal") color = "#b06000"; // Amber
        else if (stage === "Contacts") color = "#9333ea"; // Purple

        list.push({
          id: `${lead.id}-deadline`,
          projectId: lead.id,
          type: "deadline",
          title: `💼 [CRM] ${companyName} - ${projDetails}`,
          date: parsedDeadline,
          time: "17:00",
          color: color,
          project: lead
        });
      }

      // Also list last communication date as an agenda milestone event if valid
      const lastComm = asText(lead, "lastCommunicationDate");
      const parsedLastComm = parseToISODate(lastComm);
      if (parsedLastComm) {
        const companyName = asText(lead, "company") || lead.title;
        list.push({
          id: `${lead.id}-last-comm`,
          projectId: lead.id,
          type: "milestone",
          title: `📞 Last Comm: ${companyName}`,
          date: parsedLastComm,
          time: "12:00",
          color: "#5f6368", // Grey
          project: lead
        });
      }
    });

    return list;
  }, [projects, leads]);

  // 2. FILTERED EVENTS
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const proj = ev.project;
      const client = proj.type === "lead" ? (asText(proj, "company") || proj.title) : asText(proj, "client");
      const owner = proj.type === "lead" ? (asText(proj, "owner") || "Founder") : asText(proj, "owner");
      const phase = proj.type === "lead" ? (asText(proj, "stage") || proj.status) : asText(proj, "phase");
      const priority = proj.type === "lead" ? "Medium" : asText(proj, "priority");

      // Match Search
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch = !search ||
        proj.title.toLowerCase().includes(search) ||
        client.toLowerCase().includes(search) ||
        owner.toLowerCase().includes(search) ||
        ev.title.toLowerCase().includes(search);

      // Match Filters
      const matchesClient = clientFilter === "All" || client === clientFilter;
      const matchesManager = managerFilter === "All" || owner === managerFilter;
      const matchesStatus = statusFilter === "All" || phase === statusFilter;
      const matchesPriority = priorityFilter === "All" || priority === priorityFilter;

      return matchesSearch && matchesClient && matchesManager && matchesStatus && matchesPriority;
    });
  }, [allEvents, searchQuery, clientFilter, managerFilter, statusFilter, priorityFilter]);

  // 3. KPI METRICS CARDS DATA
  const kpiData = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const activeProjectsCount = projects.filter((p) => asText(p, "phase") !== "Completed").length;
    const activeLeadsCount = leads.filter((l) => asText(l, "stage") === "Project Started" || asText(l, "stage") === "Proposal").length;
    
    // Meetings Today
    const todayMeetings = allEvents.filter((e) => e.type === "meeting" && e.date === todayStr);

    // Upcoming Deadlines (Next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = getLocalDateString(nextWeek);
    
    const upcomingProjDeadlines = projects.filter((p) => {
      const due = parseToISODate(asText(p, "dueDate"));
      return due && due >= todayStr && due <= nextWeekStr && asText(p, "phase") !== "Completed";
    }).length;

    const upcomingLeadDeadlines = leads.filter((l) => {
      const due = parseToISODate(asText(l, "deadline"));
      return due && due >= todayStr && due <= nextWeekStr && asText(l, "stage") !== "Completed";
    }).length;

    // Overdue Projects & Leads
    const overdueProj = projects.filter((p) => {
      const due = parseToISODate(asText(p, "dueDate"));
      return due && due < todayStr && asText(p, "phase") !== "Completed";
    }).length;

    const overdueLeads = leads.filter((l) => {
      const due = parseToISODate(asText(l, "deadline"));
      return due && due < todayStr && asText(l, "stage") !== "Completed" && asText(l, "stage") !== "Old Leads";
    }).length;

    // Completing this month
    const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    const completingProjThisMonth = projects.filter((p) => {
      const due = parseToISODate(asText(p, "dueDate"));
      return due && due.startsWith(currentMonthPrefix);
    }).length;
    
    const completingLeadThisMonth = leads.filter((l) => {
      const due = parseToISODate(asText(l, "deadline"));
      return due && due.startsWith(currentMonthPrefix);
    }).length;

    return {
      total: projects.length + leads.length,
      active: activeProjectsCount + activeLeadsCount,
      todayMeetings: todayMeetings.length,
      upcomingDeadlines: upcomingProjDeadlines + upcomingLeadDeadlines,
      overdue: overdueProj + overdueLeads,
      completingThisMonth: completingProjThisMonth + completingLeadThisMonth
    };
  }, [projects, leads, allEvents, currentDate]);

  // 4. GENERATE DAYS FOR MONTH VIEW
  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    
    // Determine previous month buffer days to display
    const prevMonthDaysToShow = startOfMonth.getDay(); // 0 is Sunday
    const prevMonthEnd = new Date(year, month, 0).getDate();
    
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
    
    // Add buffer days from previous month
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthEnd - i);
      days.push({
        date: d,
        dateStr: getLocalDateString(d),
        isCurrentMonth: false
      });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateStr: getLocalDateString(d),
        isCurrentMonth: true
      });
    }

    // Add buffer days from next month to fill grid (6 rows of 7 days = 42 cells)
    const totalCells = 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: getLocalDateString(d),
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  // 5. GENERATE DAYS FOR WEEK VIEW (7 days starting from Sunday of the current date week)
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const sunday = new Date(currentDate);
    sunday.setDate(currentDate.getDate() - dayOfWeek);
    
    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({
        date: d,
        dateStr: getLocalDateString(d)
      });
    }
    return days;
  }, [currentDate]);

  // Extract unique clients & PMs for dropdown lists
  const clientsList = useMemo(() => {
    const list = new Set<string>();
    projects.forEach(p => {
      const c = asText(p, "client");
      if (c) list.add(c);
    });
    leads.forEach(l => {
      const c = asText(l, "company") || l.title;
      if (c) list.add(c);
    });
    return Array.from(list).filter(Boolean);
  }, [projects, leads]);

  const managersList = useMemo(() => {
    const list = new Set<string>();
    projects.forEach(p => {
      const o = asText(p, "owner");
      if (o) list.add(o);
    });
    leads.forEach(l => {
      const o = asText(l, "owner") || "Founder";
      if (o) list.add(o);
    });
    return Array.from(list).filter(Boolean);
  }, [projects, leads]);

  // Extract CRM leads that are unscheduled (no valid YYYY-MM-DD deadline)
  const unscheduledLeads = useMemo(() => {
    return leads.filter((l) => {
      const due = asText(l, "deadline");
      const parsedDue = parseToISODate(due);
      const isUnscheduled = !parsedDue;
      // Include all CRM leads that are not completed (so we capture old leads, contacts, proposals, project started)
      const stage = asText(l, "stage");
      return isUnscheduled && stage !== "Completed";
    });
  }, [leads]);

  // Navigation functions
  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(currentDate.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const navigatePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      const prev = new Date(currentDate);
      prev.setDate(currentDate.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(currentDate.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop implementation handlers
  const handleDragStartProject = (e: React.DragEvent, proj: BrainDocument) => {
    setDraggedProject(proj);
    setDraggedMeeting(null);
    e.dataTransfer.setData("type", "project");
    e.dataTransfer.setData("id", proj.id);
  };

  const handleDragStartMeeting = (e: React.DragEvent, meeting: any, projId: string) => {
    setDraggedProject(null);
    setDraggedMeeting({ projectId: projId, meetingId: meeting.id, title: meeting.title });
    e.dataTransfer.setData("type", "meeting");
    e.dataTransfer.setData("meetingId", meeting.id);
    e.dataTransfer.setData("projectId", projId);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDropTargetDate(targetDate);
    setShowConfirmModal(true);
  };

  const handleConfirmReschedule = () => {
    if (draggedProject && dropTargetDate) {
      if (draggedProject.type === "lead") {
        onUpdateLead(draggedProject.id, { deadline: dropTargetDate });
      } else {
        onUpdateProject(draggedProject.id, { dueDate: dropTargetDate });
      }
    } else if (draggedMeeting && dropTargetDate) {
      // Find parent object (project or CRM lead)
      const targetObj = projects.find((p) => p.id === draggedMeeting.projectId) || leads.find((l) => l.id === draggedMeeting.projectId);
      if (targetObj) {
        const isLead = targetObj.type === "lead";
        const raw = targetObj.fields.meetings;
        let meetingsList: any[] = [];
        if (raw && typeof raw === "string") {
          try { meetingsList = JSON.parse(raw); } catch (_) {}
        }
        
        // Update specific meeting date
        const updated = meetingsList.map((m: any) => {
          if (m.id === draggedMeeting.meetingId) {
            return { ...m, date: dropTargetDate };
          }
          return m;
        });

        if (isLead) {
          onUpdateLead(targetObj.id, { meetings: JSON.stringify(updated) });
        } else {
          onUpdateProject(targetObj.id, { meetings: JSON.stringify(updated) });
        }
      }
    }
    
    // Reset states
    setDraggedProject(null);
    setDraggedMeeting(null);
    setDropTargetDate(null);
    setShowConfirmModal(false);
  };

  // Add Event Form Handlers
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetObj = projects.find((p) => p.id === newEvent.projectId) || leads.find((l) => l.id === newEvent.projectId);
    if (!targetObj) return;

    const isLead = targetObj.type === "lead";

    if (newEvent.type === "meeting") {
      const raw = targetObj.fields.meetings;
      let meetingsList: any[] = [];
      if (raw && typeof raw === "string") {
        try { meetingsList = JSON.parse(raw); } catch (_) {}
      }

      meetingsList.push({
        id: `meeting-${Date.now()}`,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        summary: newEvent.summary,
        participants: [targetObj.fields.owner || "Owner"]
      });

      if (isLead) {
        onUpdateLead(targetObj.id, { meetings: JSON.stringify(meetingsList) });
      } else {
        onUpdateProject(targetObj.id, { meetings: JSON.stringify(meetingsList) });
      }
    } else if (newEvent.type === "milestone") {
      const raw = targetObj.fields.milestones;
      let milestonesList: any[] = [];
      if (raw && typeof raw === "string") {
        try { milestonesList = JSON.parse(raw); } catch (_) {}
      }

      milestonesList.push({
        id: `milestone-${Date.now()}`,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        summary: newEvent.summary
      });

      if (isLead) {
        onUpdateLead(targetObj.id, { milestones: JSON.stringify(milestonesList) });
      } else {
        onUpdateProject(targetObj.id, { milestones: JSON.stringify(milestonesList) });
      }
    } else if (newEvent.type === "deadline") {
      if (isLead) {
        onUpdateLead(targetObj.id, { deadline: newEvent.date });
      } else {
        onUpdateProject(targetObj.id, { dueDate: newEvent.date });
      }
    }

    setShowAddEventModal(false);
    setNewEvent({
      projectId: "",
      type: "meeting",
      title: "",
      date: new Date().toISOString().slice(0, 10),
      time: "10:00",
      summary: ""
    });
  };

  return (
    <div className="calendar-overlay">
      <div className="calendar-container">
        
        {/* HEADER BAR */}
        <header className="calendar-header-panel">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarIcon size={24} style={{ color: "var(--green)" }} />
            <div>
              <span className="eyebrow" style={{ margin: 0 }}>CRM Module</span>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Project Calendar</h2>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="primary-button" onClick={() => setShowAddEventModal(true)}>
              <Plus size={16} />
              <span>Add Event</span>
            </button>
            <button className="secondary-button" onClick={onClose}>
              <X size={16} />
              <span>Back to CRM</span>
            </button>
          </div>
        </header>

        {/* KPI METRIC CARDS ROW */}
        <section className="calendar-kpis-grid">
          <div className="kpi-card-glass">
            <span>Total Projects</span>
            <strong>{kpiData.total}</strong>
          </div>
          <div className="kpi-card-glass">
            <span>Active Projects</span>
            <strong style={{ color: "var(--green)" }}>{kpiData.active}</strong>
          </div>
          <div className="kpi-card-glass">
            <span>Today's Meetings</span>
            <strong style={{ color: "#1a73e8" }}>{kpiData.todayMeetings}</strong>
          </div>
          <div className="kpi-card-glass">
            <span>Upcoming Deadlines</span>
            <strong style={{ color: "var(--amber)" }}>{kpiData.upcomingDeadlines}</strong>
          </div>
          <div className="kpi-card-glass">
            <span>Overdue Projects</span>
            <strong style={{ color: "var(--red)" }}>{kpiData.overdue}</strong>
          </div>
          <div className="kpi-card-glass">
            <span>Due This Month</span>
            <strong style={{ color: "#9333ea" }}>{kpiData.completingThisMonth}</strong>
          </div>
        </section>

        {/* TOOLBAR CONTROLS (Views, filters, search) */}
        <section className="calendar-toolbar">
          <div className="toolbar-left">
            <div className="nav-controls">
              <button onClick={navigatePrev} className="toolbar-btn"><ChevronLeft size={16} /></button>
              <button onClick={navigateToday} className="toolbar-btn text-btn">Today</button>
              <button onClick={navigateNext} className="toolbar-btn"><ChevronRight size={16} /></button>
            </div>
            
            <h3 className="current-date-title">
              {viewMode === "month" && currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              {viewMode === "week" && `Week of ${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              {viewMode === "day" && currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              {viewMode === "agenda" && "Agenda Schedule"}
            </h3>
          </div>

          <div className="toolbar-right">
            {/* Search Bar */}
            <div className="search-bar-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects, client, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button 
              className={`toolbar-btn text-btn ${showFilters ? "active" : ""}`} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} style={{ marginRight: "6px" }} />
              <span>Filters</span>
            </button>

            {/* View Selectors */}
            <div className="view-selectors">
              {(["month", "week", "day", "agenda"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`view-btn ${viewMode === mode ? "active" : ""}`}
                  onClick={() => setViewMode(mode)}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* COLLAPSIBLE FILTER PANEL */}
        {showFilters && (
          <section className="collapsible-filters-panel animate-slide-down">
            <div className="filter-grid-row">
              <label className="filter-control">
                <span>Client</span>
                <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                  <option value="All">All Clients</option>
                  {clientsList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="filter-control">
                <span>Manager</span>
                <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                  <option value="All">All Managers</option>
                  {managersList.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>

              <label className="filter-control">
                <span>Project Stage</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Stages</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Prototype">Prototype</option>
                  <option value="Build">Build</option>
                  <option value="QA">QA</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Completed">Completed</option>
                  {/* CRM stages */}
                  <option value="Old Leads">Old Leads</option>
                  <option value="Contacts">Contacts</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Project Started">Project Started</option>
                </select>
              </label>

              <label className="filter-control">
                <span>Priority</span>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="All">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>
              
              <button 
                className="secondary-button" 
                style={{ alignSelf: "flex-end", height: "36px" }}
                onClick={() => {
                  setClientFilter("All");
                  setManagerFilter("All");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          </section>
        )}

        {/* LEGEND ROW */}
        <div className="legend-legend-row">
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700 }}>LEGEND:</span>
          {Object.entries(statusColors).map(([status, style]) => (
            <div key={status} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: style.text }}></span>
              <span>{style.label}</span>
            </div>
          ))}
        </div>

        {/* MAIN CALENDAR AND WORKSPACE BODY */}
        <div className="calendar-body-workspace">
          
          {/* LEFT AREA: CALENDAR VIEW */}
          <div className="calendar-grid-wrapper">
            
            {/* MONTH VIEW */}
            {viewMode === "month" && (
              <div className="month-calendar-grid">
                {/* Header Row: Days of Week */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="grid-header-day">{d}</div>
                ))}
                
                {/* Day Cells */}
                {calendarDays.map((day, idx) => {
                  const dayEvents = filteredEvents.filter((e) => e.date === day.dateStr);
                  const isToday = day.dateStr === getLocalDateString(new Date());
                  
                  return (
                    <div
                      key={idx}
                      className={`grid-day-cell ${day.isCurrentMonth ? "" : "out-month"} ${isToday ? "today-cell" : ""}`}
                      onDragOver={(e) => handleDragOver(e, day.dateStr)}
                      onDrop={(e) => handleDrop(e, day.dateStr)}
                    >
                      <div className="day-number-row">
                        <span className={isToday ? "today-number-badge" : ""}>{day.date.getDate()}</span>
                      </div>
                      
                      <div className="day-events-stack">
                        {dayEvents.map((ev) => {
                          const health = ev.project.type === "lead" ? asText(ev.project, "stage") : ev.project.fields.health;
                          const eventTheme = statusColors[health] || statusColors["Meeting"];
                          const isMeeting = ev.type === "meeting";
                          const isMilestone = ev.type === "milestone";
                          let colorStyle = {
                            background: isMeeting ? statusColors["Meeting"].bg : isMilestone ? statusColors["Milestone"].bg : eventTheme.bg,
                            color: isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text,
                            borderLeft: `3px solid ${isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text}`
                          };

                          return (
                            <div
                              key={ev.id}
                              className="day-event-card animate-fade-in"
                              style={colorStyle}
                              draggable
                              onDragStart={(e) => isMeeting ? handleDragStartMeeting(e, ev.originalMeeting, ev.projectId) : handleDragStartProject(e, ev.project)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProject(ev.project);
                              }}
                            >
                              <span className="event-time-prefix">{ev.time}</span>
                              <span className="event-title-text">{ev.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === "week" && (
              <div className="week-calendar-grid">
                {/* Columns representing days */}
                {weekDays.map((day) => {
                  const dayEvents = filteredEvents.filter((e) => e.date === day.dateStr);
                  const isToday = day.dateStr === getLocalDateString(new Date());
                  
                  return (
                    <div 
                      key={day.dateStr} 
                      className={`week-day-column ${isToday ? "today-column" : ""}`}
                      onDragOver={(e) => handleDragOver(e, day.dateStr)}
                      onDrop={(e) => handleDrop(e, day.dateStr)}
                    >
                      <div className="week-day-header">
                        <strong>{day.date.toLocaleDateString("en-US", { weekday: "short" })}</strong>
                        <span className={isToday ? "today-number-badge" : ""}>{day.date.getDate()}</span>
                      </div>
                      
                      <div className="week-events-stack">
                        {dayEvents.length === 0 ? (
                          <div className="empty-day-placeholder">No events</div>
                        ) : (
                          dayEvents.map((ev) => {
                          const health = ev.project.type === "lead" ? asText(ev.project, "stage") : ev.project.fields.health;
                          const eventTheme = statusColors[health] || statusColors["Meeting"];
                          const isMeeting = ev.type === "meeting";
                          const isMilestone = ev.type === "milestone";
                          
                          return (
                            <div
                              key={ev.id}
                              className="week-event-box"
                              style={{
                                background: isMeeting ? statusColors["Meeting"].bg : isMilestone ? statusColors["Milestone"].bg : eventTheme.bg,
                                color: isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text,
                                borderLeft: `4px solid ${isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text}`
                              }}
                              draggable
                              onDragStart={(e) => isMeeting ? handleDragStartMeeting(e, ev.originalMeeting, ev.projectId) : handleDragStartProject(e, ev.project)}
                              onClick={() => setSelectedProject(ev.project)}
                            >
                              <span className="week-time">{ev.time}</span>
                              <strong>{ev.title}</strong>
                              <small>{ev.project.type === "lead" ? (asText(ev.project, "company") || ev.project.title) : asText(ev.project, "client")}</small>
                            </div>
                          );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DAY VIEW */}
            {viewMode === "day" && (
              <div className="day-calendar-view" onDragOver={(e) => handleDragOver(e, currentDate.toISOString().slice(0, 10))} onDrop={(e) => handleDrop(e, currentDate.toISOString().slice(0, 10))}>
                <div className="day-hours-list">
                  {filteredEvents.filter((e) => e.date === currentDate.toISOString().slice(0, 10)).map((ev) => {
                    const health = ev.project.type === "lead" ? asText(ev.project, "stage") : ev.project.fields.health;
                    const eventTheme = statusColors[health] || statusColors["Meeting"];
                    const isMeeting = ev.type === "meeting";
                    const isMilestone = ev.type === "milestone";
                    const clientLabel = ev.project.type === "lead" ? (asText(ev.project, "company") || ev.project.title) : asText(ev.project, "client");
                    const ownerLabel = ev.project.type === "lead" ? (asText(ev.project, "owner") || "Founder") : asText(ev.project, "owner");
                    
                    return (
                      <div
                        key={ev.id}
                        className="day-full-event-row"
                        style={{
                          background: isMeeting ? statusColors["Meeting"].bg : isMilestone ? statusColors["Milestone"].bg : eventTheme.bg,
                          color: isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text,
                          borderLeft: `5px solid ${isMeeting ? statusColors["Meeting"].text : isMilestone ? statusColors["Milestone"].text : eventTheme.text}`
                        }}
                        onClick={() => setSelectedProject(ev.project)}
                      >
                        <div className="day-row-time">{ev.time}</div>
                        <div className="day-row-details">
                          <h4>{ev.title}</h4>
                          <span>Client: {clientLabel} | Owner: {ownerLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredEvents.filter((e) => e.date === currentDate.toISOString().slice(0, 10)).length === 0 && (
                    <div className="empty-state" style={{ height: "200px" }}>
                      <strong>No Schedule Configured</strong>
                      <span>Nothing is scheduled for this date. Drag a project or schedule a meeting.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AGENDA VIEW */}
            {viewMode === "agenda" && (
              <div className="agenda-calendar-view">
                <div className="agenda-list">
                  {filteredEvents
                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                    .map((ev) => {
                      const health = ev.project.type === "lead" ? asText(ev.project, "stage") : ev.project.fields.health;
                      const eventTheme = statusColors[health] || statusColors["Meeting"];
                      const isMeeting = ev.type === "meeting";
                      const isMilestone = ev.type === "milestone";
                      const isOverdue = ev.date < new Date().toISOString().slice(0, 10) && ev.project.fields.phase !== "Completed" && ev.project.fields.stage !== "Completed";
                      const clientLabel = ev.project.type === "lead" ? (asText(ev.project, "company") || ev.project.title) : asText(ev.project, "client");
                      const ownerLabel = ev.project.type === "lead" ? (asText(ev.project, "owner") || "Founder") : asText(ev.project, "owner");

                      return (
                        <div key={ev.id} className="agenda-item-card" onClick={() => setSelectedProject(ev.project)}>
                          <div className="agenda-date-badge">
                            <strong>{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
                            <span>{new Date(ev.date).toLocaleDateString("en-US", { weekday: "short" })}</span>
                          </div>
                          
                          <div className="agenda-card-details">
                            <div className="agenda-top-line">
                              <span className="agenda-type" style={{ color: isMeeting ? "#1a73e8" : isMilestone ? "#9333ea" : eventTheme.text }}>
                                {ev.type.toUpperCase()}
                              </span>
                              {isOverdue && <span className="agenda-overdue-flag">OVERDUE</span>}
                            </div>
                            <h4>{ev.title}</h4>
                            <span className="agenda-meta">
                              Time: <strong>{ev.time}</strong> | Client: {clientLabel} | PM: {ownerLabel}
                            </span>
                          </div>
                          
                          <ArrowRight size={18} style={{ color: "var(--muted)" }} />
                        </div>
                      );
                    })}

                  {filteredEvents.length === 0 && (
                    <div className="empty-state">
                      <strong>No Agenda Events Found</strong>
                      <span>Add events or adjust your search filters.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT AREA: UPCOMING EVENTS / SCHEDULE PANEL */}
          <aside className="upcoming-events-sidebar">
            
            {/* Missed/Overdue Projects panel */}
            <div className="sidebar-group panel-soft">
              <div className="group-header" style={{ color: "var(--red)" }}>
                <AlertTriangle size={16} />
                <span>Overdue & Delayed ({kpiData.overdue})</span>
              </div>
              <div className="group-items-stack">
                {[
                  ...projects.filter((p) => {
                    const due = parseToISODate(asText(p, "dueDate"));
                    return due && due < new Date().toISOString().slice(0, 10) && asText(p, "phase") !== "Completed";
                  }),
                  ...leads.filter((l) => {
                    const due = parseToISODate(asText(l, "deadline"));
                    return due && due < new Date().toISOString().slice(0, 10) && asText(l, "stage") !== "Completed" && asText(l, "stage") !== "Old Leads";
                  })
                ].map((p) => (
                  <div 
                    key={p.id} 
                    className="sidebar-item-card" 
                    onClick={() => setSelectedProject(p)}
                    draggable={true}
                    onDragStart={(e) => handleDragStartProject(e, p)}
                    style={{ cursor: "grab" }}
                  >
                    <strong>{p.type === "lead" ? `💼 ${asText(p, "company") || p.title}` : p.title}</strong>
                    <span className="red-badge">Due {p.type === "lead" ? asText(p, "deadline") : asText(p, "dueDate")}</span>
                  </div>
                ))}
                {kpiData.overdue === 0 && <span className="empty-list-label">All projects are on track! 🎉</span>}
              </div>
            </div>

            {/* This Week Deadlines & Milestones */}
            <div className="sidebar-group panel-soft">
              <div className="group-header" style={{ color: "var(--amber)" }}>
                <Clock size={16} />
                <span>Due This Week</span>
              </div>
              <div className="group-items-stack">
                {[
                  ...projects.filter((p) => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    const nextWeekStr = nextWeek.toISOString().slice(0, 10);
                    const due = parseToISODate(asText(p, "dueDate"));
                    return due && due >= todayStr && due <= nextWeekStr && asText(p, "phase") !== "Completed";
                  }),
                  ...leads.filter((l) => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    const nextWeekStr = nextWeek.toISOString().slice(0, 10);
                    const due = parseToISODate(asText(l, "deadline"));
                    return due && due >= todayStr && due <= nextWeekStr && asText(l, "stage") !== "Completed";
                  })
                ].map((p) => (
                  <div 
                    key={p.id} 
                    className="sidebar-item-card" 
                    onClick={() => setSelectedProject(p)}
                    draggable={true}
                    onDragStart={(e) => handleDragStartProject(e, p)}
                    style={{ cursor: "grab" }}
                  >
                    <strong>{p.type === "lead" ? `💼 ${asText(p, "company") || p.title}` : p.title}</strong>
                    <span>Due {p.type === "lead" ? asText(p, "deadline") : asText(p, "dueDate")} ({p.type === "lead" ? asText(p, "company") : asText(p, "client")})</span>
                  </div>
                ))}
                {projects.filter((p) => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  const nextWeekStr = nextWeek.toISOString().slice(0, 10);
                  const due = parseToISODate(asText(p, "dueDate"));
                  return due && due >= todayStr && due <= nextWeekStr && asText(p, "phase") !== "Completed";
                }).length === 0 && leads.filter((l) => {
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  const nextWeekStr = nextWeek.toISOString().slice(0, 10);
                  const due = parseToISODate(asText(l, "deadline"));
                  return due && due >= todayStr && due <= nextWeekStr && asText(l, "stage") !== "Completed";
                }).length === 0 && <span className="empty-list-label">No deadlines this week.</span>}
              </div>
            </div>

            {/* Today's Meetings Panel */}
            <div className="sidebar-group panel-soft">
              <div className="group-header" style={{ color: "#1a73e8" }}>
                <Users size={16} />
                <span>Today's Meetings ({kpiData.todayMeetings})</span>
              </div>
              <div className="group-items-stack">
                {allEvents
                  .filter((e) => e.type === "meeting" && e.date === new Date().toISOString().slice(0, 10))
                  .map((m) => (
                    <div key={m.id} className="sidebar-item-card" onClick={() => setSelectedProject(m.project)}>
                      <strong>{m.title.replace("👥 ", "")}</strong>
                      <span>At {m.time} | {m.project.title || asText(m.project, "company")}</span>
                    </div>
                  ))}
                {kpiData.todayMeetings === 0 && <span className="empty-list-label">No meetings scheduled for today.</span>}
              </div>
            </div>

            {/* Unscheduled CRM Leads Panel */}
            <div className="sidebar-group panel-soft">
              <div className="group-header" style={{ color: "var(--muted)" }}>
                <CalendarIcon size={16} />
                <span>Unscheduled CRM ({unscheduledLeads.length})</span>
              </div>
              <div className="group-items-stack" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {unscheduledLeads.map((l) => (
                  <div 
                    key={l.id} 
                    className="sidebar-item-card" 
                    onClick={() => setSelectedProject(l)}
                    draggable={true}
                    onDragStart={(e) => handleDragStartProject(e, l)}
                    style={{ cursor: "grab" }}
                  >
                    <strong>💼 {asText(l, "company") || l.title}</strong>
                    <span>Stage: {asText(l, "stage")}</span>
                    <span style={{ fontSize: "0.68rem", opacity: 0.8, color: "var(--green)" }}>Drag to calendar to schedule</span>
                  </div>
                ))}
                {unscheduledLeads.length === 0 && <span className="empty-list-label">All leads/projects are scheduled!</span>}
              </div>
            </div>

          </aside>

        </div>

        {/* SIDE DETAIL DRAWER PANEL */}
        {selectedProject && (() => {
          const isLead = selectedProject.type === "lead";
          const clientName = isLead ? (asText(selectedProject, "company") || selectedProject.title) : asText(selectedProject, "client");
          const projectTitle = isLead ? (asText(selectedProject, "projectDetails") || "CRM Lead Project") : selectedProject.title;
          const leadStage = asText(selectedProject, "stage");
          const progressPct = isLead ? 
            (leadStage === "Completed" ? 100 : leadStage === "Project Started" ? 60 : leadStage === "Proposal" ? 30 : leadStage === "Contacts" ? 15 : 0) : 
            asNumber(selectedProject, "progress");
          const statusLabel = isLead ? asText(selectedProject, "stage") : asText(selectedProject, "phase");
          const priorityLabel = isLead ? "Medium" : asText(selectedProject, "priority");
          const pmName = isLead ? (asText(selectedProject, "owner") || "Founder") : asText(selectedProject, "owner");
          const targetDate = isLead ? asText(selectedProject, "deadline") : asText(selectedProject, "dueDate");
          const budgetAmt = isLead ? (asNumber(selectedProject, "potentialValueInr") || asNumber(selectedProject, "contractValue")) : asNumber(selectedProject, "budgetInr");
          const descBody = isLead ? (asText(selectedProject, "communicationStatus") || selectedProject.body) : selectedProject.body;
          const nextAction = isLead ? asText(selectedProject, "nextAction") : "";
          const daysLeft = targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate) ? Math.ceil(
            (new Date(targetDate).getTime() - new Date().getTime()) / 
            (1000 * 60 * 60 * 24)
          ) : null;

          return (
            <div className="side-drawer-backdrop" onClick={() => setSelectedProject(null)}>
              <div className="side-drawer-panel animate-slide-left" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                  <div>
                    <span className="eyebrow">{clientName}</span>
                    <h3>{projectTitle}</h3>
                  </div>
                  <button className="icon-button" onClick={() => setSelectedProject(null)}><X size={18} /></button>
                </div>

                <div className="drawer-body">
                  {/* Metrics */}
                  <div className="drawer-metric-grid">
                    <div className="drawer-metric">
                      <span>Progress</span>
                      <strong>{progressPct}%</strong>
                    </div>
                    <div className="drawer-metric">
                      <span>Status</span>
                      <strong style={{ color: "var(--green)" }}>{statusLabel}</strong>
                    </div>
                    <div className="drawer-metric">
                      <span>Priority</span>
                      <strong style={{ color: selectedProject.fields.priority === "High" ? "var(--red)" : "var(--muted)" }}>
                        {priorityLabel}
                      </strong>
                    </div>
                  </div>

                  {/* Info List */}
                  <div className="drawer-info-list">
                    <div className="info-row">
                      <span>Project Manager</span>
                      <strong>{pmName}</strong>
                    </div>
                    <div className="info-row">
                      <span>Due Date</span>
                      <strong>{targetDate || "N/A"}</strong>
                    </div>
                    <div className="info-row">
                      <span>Remaining Days</span>
                      <strong>
                        {daysLeft !== null ? `${daysLeft} Days` : "N/A"}
                      </strong>
                    </div>
                    <div className="info-row">
                      <span>Value / Budget</span>
                      <strong>INR {budgetAmt.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="drawer-section">
                    <h4>Description / Status</h4>
                    <p>{descBody || "No description provided."}</p>
                  </div>

                  {/* Next steps / Action items */}
                  {nextAction && (
                    <div className="drawer-section border-top">
                      <h4>Next Steps</h4>
                      <p style={{ background: "rgba(22, 120, 79, 0.05)", padding: "8px 10px", borderRadius: "6px", fontSize: "0.82rem", color: "var(--green)" }}>
                        {nextAction}
                      </p>
                    </div>
                  )}

                  {/* Risks / Flags */}
                  {!isLead && asText(selectedProject, "risk") && (
                    <div className="drawer-section border-top">
                      <h4 style={{ color: "var(--red)" }}>Risks / Flags</h4>
                      <p style={{ color: "var(--red)", background: "#fef2f2", padding: "8px 10px", borderRadius: "6px", fontSize: "0.8rem" }}>
                        {asText(selectedProject, "risk")}
                      </p>
                    </div>
                  )}

                  {/* Upcoming Meetings List */}
                  <div className="drawer-section border-top">
                    <h4>Upcoming Meetings</h4>
                    <div className="drawer-meetings-stack">
                      {(() => {
                        const raw = selectedProject.fields.meetings;
                        let list: any[] = [];
                        if (raw && typeof raw === "string") {
                          try { list = JSON.parse(raw); } catch (_) {}
                        }
                        if (list.length === 0) {
                          return <span className="empty-list-label">No scheduled meetings.</span>;
                        }
                        return list.map((m) => (
                          <div key={m.id} className="drawer-meeting-item">
                            <div>
                              <strong>{m.title}</strong>
                              <span>{m.date} at {m.time}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="drawer-footer">
                  {isLead ? (
                    onEditLead && (
                      <button className="primary-button" onClick={() => { onEditLead(selectedProject); setSelectedProject(null); }}>
                        Open CRM Record
                      </button>
                    )
                  ) : (
                    <button className="primary-button" onClick={() => { onViewProject(selectedProject.id); setSelectedProject(null); }}>
                      View Project Workspace
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* FLOATING QUICK ADD EVENT MODAL */}
        {showAddEventModal && (
          <div className="modal-backdrop" onClick={() => setShowAddEventModal(false)}>
            <div className="employee-edit-panel employee-edit-modal" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Quick Add</p>
                  <h3>Schedule Project Event</h3>
                </div>
                <button className="icon-button" onClick={() => setShowAddEventModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddEvent} className="employee-edit-grid" style={{ gridTemplateColumns: "1fr", gap: "14px", padding: "20px" }}>
                <label className="field-control">
                  <span>Project Reference</span>
                  <select 
                    value={newEvent.projectId} 
                    onChange={(e) => setNewEvent({ ...newEvent, projectId: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Project / Client</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>🏁 {p.title} (Project)</option>)}
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        💼 {asText(l, "company") || l.title} (CRM Client)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-control">
                  <span>Event Type</span>
                  <select 
                    value={newEvent.type} 
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="milestone">Milestone</option>
                    <option value="deadline">Reschedule Due Date</option>
                  </select>
                </label>

                <label className="field-control">
                  <span>Event Title</span>
                  <input
                    type="text"
                    placeholder="e.g. Design Review / Client Sync"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required={newEvent.type !== "deadline"}
                    disabled={newEvent.type === "deadline"}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label className="field-control">
                    <span>Date</span>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      required
                    />
                  </label>

                  <label className="field-control">
                    <span>Time</span>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      required={newEvent.type !== "deadline"}
                      disabled={newEvent.type === "deadline"}
                    />
                  </label>
                </div>

                <label className="field-control">
                  <span>Summary Details</span>
                  <textarea
                    placeholder="Provide targets or objectives for this event..."
                    value={newEvent.summary}
                    onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                    style={{ minHeight: "80px", padding: "8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                  />
                </label>

                <div className="editor-footer" style={{ border: "none", padding: 0, marginTop: "10px" }}>
                  <div className="editor-actions" style={{ justifyContent: "flex-end", width: "100%" }}>
                    <button type="button" className="secondary-button" onClick={() => setShowAddEventModal(false)}>Cancel</button>
                    <button type="submit" className="primary-button">Create Event</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONFIRM RESCHEDULE DIALOG MODAL */}
        {showConfirmModal && (
          <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
            <div className="employee-edit-panel employee-edit-modal" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Confirm Action</p>
                  <h3>Reschedule Schedule Date?</h3>
                </div>
                <button className="icon-button" onClick={() => setShowConfirmModal(false)}><X size={18} /></button>
              </div>

              <div style={{ padding: "20px", fontSize: "0.9rem", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p>
                  Are you sure you want to reschedule this item to <strong>{dropTargetDate}</strong>?
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button className="secondary-button" onClick={() => { setShowConfirmModal(false); setDraggedProject(null); setDraggedMeeting(null); }}>Cancel</button>
                  <button className="primary-button" onClick={handleConfirmReschedule}>Confirm & Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
