import type { BrainDocument } from "./types";
import { sheetEmployeeDocuments } from "./sheet-employee-documents";
import { sheetLeadDocuments } from "./sheet-lead-documents";

const today = "2026-06-17";

const employee = (
  id: string,
  title: string,
  fields: BrainDocument["fields"],
  body: string
): BrainDocument => ({
  id,
  type: "employee",
  title,
  status: String(fields.status),
  owner: "Founder Office",
  updatedAt: today,
  tags: ["employee", String(fields.department), String(fields.status)],
  fields,
  body
});

const project = (
  id: string,
  title: string,
  fields: BrainDocument["fields"],
  body: string
): BrainDocument => ({
  id,
  type: "project",
  title,
  status: String(fields.phase),
  owner: String(fields.owner),
  updatedAt: today,
  tags: ["ai-project", String(fields.phase), String(fields.health)],
  fields,
  body
});

const client = (
  id: string,
  title: string,
  fields: BrainDocument["fields"],
  body: string
): BrainDocument => ({
  id,
  type: "client",
  title,
  status: String(fields.relationshipStage),
  owner: String(fields.accountOwner),
  updatedAt: today,
  tags: ["client", String(fields.industry), String(fields.health)],
  fields,
  body
});

const lead = (
  id: string,
  title: string,
  fields: BrainDocument["fields"],
  body: string
): BrainDocument => ({
  id,
  type: "lead",
  title,
  status: String(fields.stage),
  owner: String(fields.owner),
  updatedAt: today,
  tags: ["lead", String(fields.stage), String(fields.source)],
  fields,
  body
});

const baseBrainDocuments: BrainDocument[] = [
  ...sheetEmployeeDocuments,
  /*
  employee(
    "emp-aisha-menon",
    "Aisha Menon - Head of Operations",
    {
      name: "Aisha Menon",
      role: "Head of Operations",
      department: "Operations",
      monthlySalaryInr: 220000,
      dateOfJoining: "2023-07-10",
      status: "Active",
      pan: "AXIPM4821K",
      aadhaar: "4382 9124 5501",
      email: "aisha.menon@enxt.ai",
      phone: "+91 90000 11001",
      location: "Bengaluru",
      reportingTo: "Founder"
    },
    `Aisha owns operating cadence, internal process hygiene, vendor coordination, and founder follow-through. She maintains weekly execution reviews, project owner check-ins, invoice reminders, and hiring coordination. Current focus is turning scattered updates into repeatable operating rituals for Enxt Brain.`
  ),
  employee(
    "emp-rohan-iyer",
    "Rohan Iyer - AI Engineer",
    {
      name: "Rohan Iyer",
      role: "AI Engineer",
      department: "Engineering",
      monthlySalaryInr: 180000,
      dateOfJoining: "2024-01-15",
      status: "Active",
      pan: "BDQPI1934L",
      aadhaar: "7251 4902 1188",
      email: "rohan.iyer@enxt.ai",
      phone: "+91 90000 11002",
      location: "Chennai",
      reportingTo: "Nikhil Verma"
    },
    `Rohan builds retrieval, prompt orchestration, and model evaluation workflows. He is strongest with Python, LangChain-style pipelines, embeddings, and API integration. Current assignments include Pinecone schema tests and retrieval quality checks for document-grounded answers.`
  ),
  employee(
    "emp-meera-kapoor",
    "Meera Kapoor - Product Designer",
    {
      name: "Meera Kapoor",
      role: "Product Designer",
      department: "Product",
      monthlySalaryInr: 155000,
      dateOfJoining: "2023-11-06",
      status: "Active",
      pan: "CQWPK6421J",
      aadhaar: "2198 3304 7762",
      email: "meera.kapoor@enxt.ai",
      phone: "+91 90000 11003",
      location: "Mumbai",
      reportingTo: "Founder"
    },
    `Meera designs dashboards, CRM flows, document review surfaces, and founder-facing chat experiences. She is responsible for making dense operational data readable without turning the product into a marketing page.`
  ),
  employee(
    "emp-karan-shah",
    "Karan Shah - Full Stack Developer",
    {
      name: "Karan Shah",
      role: "Full Stack Developer",
      department: "Engineering",
      monthlySalaryInr: 165000,
      dateOfJoining: "2024-02-01",
      status: "Active",
      pan: "DLMPS9351Q",
      aadhaar: "6632 1188 9041",
      email: "karan.shah@enxt.ai",
      phone: "+91 90000 11004",
      location: "Ahmedabad",
      reportingTo: "Nikhil Verma"
    },
    `Karan owns Next.js implementation, API routes, authentication, database integration, and deployability. He is the primary developer for internal tools and founder dashboards.`
  ),
  employee(
    "emp-nikhil-verma",
    "Nikhil Verma - Lead ML Engineer",
    {
      name: "Nikhil Verma",
      role: "Lead ML Engineer",
      department: "Engineering",
      monthlySalaryInr: 190000,
      dateOfJoining: "2023-09-18",
      status: "Active",
      pan: "EAVPV7108D",
      aadhaar: "8871 4409 1206",
      email: "nikhil.verma@enxt.ai",
      phone: "+91 90000 11005",
      location: "Hyderabad",
      reportingTo: "Founder"
    },
    `Nikhil leads model strategy, evaluation standards, data privacy reviews, and production AI architecture. His current focus is SLM routing, document mutation safety, and quality gates before AI-generated changes are applied.`
  ),
  employee(
    "emp-priya-nair",
    "Priya Nair - Sales Lead",
    {
      name: "Priya Nair",
      role: "Sales Lead",
      department: "Sales",
      monthlySalaryInr: 145000,
      dateOfJoining: "2024-03-12",
      status: "Active",
      pan: "FJRPN2944M",
      aadhaar: "3401 2088 5510",
      email: "priya.nair@enxt.ai",
      phone: "+91 90000 11006",
      location: "Kochi",
      reportingTo: "Founder"
    },
    `Priya manages inbound leads, qualification, follow-ups, proposal coordination, and CRM hygiene. Her pipeline focus is mid-market AI automation projects in healthcare, retail, and professional services.`
  ),
  employee(
    "emp-sanjay-rao",
    "Sanjay Rao - Customer Success Manager",
    {
      name: "Sanjay Rao",
      role: "Customer Success Manager",
      department: "Customer Success",
      monthlySalaryInr: 130000,
      dateOfJoining: "2024-04-08",
      status: "Active",
      pan: "GQRPR5502H",
      aadhaar: "9027 6610 4381",
      email: "sanjay.rao@enxt.ai",
      phone: "+91 90000 11007",
      location: "Pune",
      reportingTo: "Aisha Menon"
    },
    `Sanjay owns onboarding, adoption tracking, renewal risk notes, meeting summaries, and client satisfaction follow-through. He keeps account context current for the founder.`
  ),
  employee(
    "emp-kavya-singh",
    "Kavya Singh - HR and Finance Executive",
    {
      name: "Kavya Singh",
      role: "HR and Finance Executive",
      department: "People",
      monthlySalaryInr: 95000,
      dateOfJoining: "2024-06-03",
      status: "Active",
      pan: "HSTPS3104C",
      aadhaar: "5504 2918 3370",
      email: "kavya.singh@enxt.ai",
      phone: "+91 90000 11008",
      location: "Delhi",
      reportingTo: "Aisha Menon"
    },
    `Kavya maintains employee documents, payroll notes, invoice documentation, offer letters, policy acknowledgements, and monthly founder reports.`
  ),
  employee(
    "emp-imran-qureshi",
    "Imran Qureshi - Data Engineer",
    {
      name: "Imran Qureshi",
      role: "Data Engineer",
      department: "Engineering",
      monthlySalaryInr: 160000,
      dateOfJoining: "2024-05-20",
      status: "Active",
      pan: "JXYPQ8912N",
      aadhaar: "7166 4092 8803",
      email: "imran.qureshi@enxt.ai",
      phone: "+91 90000 11009",
      location: "Lucknow",
      reportingTo: "Nikhil Verma"
    },
    `Imran manages data extraction, cleaning, schema mapping, vector ingestion prep, and migration utilities. He is accountable for moving client documents into reliable searchable corpora.`
  ),
  employee(
    "emp-devika-arora",
    "Devika Arora - Prompt Engineer",
    {
      name: "Devika Arora",
      role: "Prompt Engineer",
      department: "AI Delivery",
      monthlySalaryInr: 125000,
      dateOfJoining: "2025-01-09",
      status: "Probation",
      pan: "KLPPA4107R",
      aadhaar: "1088 7642 3125",
      email: "devika.arora@enxt.ai",
      phone: "+91 90000 11010",
      location: "Jaipur",
      reportingTo: "Rohan Iyer"
    },
    `Devika creates prompt libraries, evaluation examples, response style guides, and project-specific AI behavior notes. She is currently building the founder tone and CRM answer templates for Enxt Brain.`
  ),
  */
  project(
    "proj-talentpulse",
    "TalentPulse HR Copilot",
    {
      client: "Nova Retail Labs",
      phase: "Build",
      owner: "Rohan Iyer",
      health: "Green",
      priority: "High",
      dueDate: "2026-08-15",
      budgetInr: 1850000,
      progress: 62,
      risk: "Employee data privacy review must be completed before production sync."
    },
    `Objective: Build an HR copilot that answers employee policy, leave, payroll, and internal process questions from approved company documents.

Scope: Document ingestion, role-aware retrieval, answer citations, admin review workflow, and audit logs for sensitive queries.

Data sources: HR handbook, leave policy, payroll FAQ, offer letter templates, onboarding checklists, and anonymized support tickets.

Current status: Retrieval pipeline and admin dashboard are working in staging. The team is tuning answer confidence thresholds and redaction behavior.

Success metric: Reduce routine HR support questions by 45 percent within 60 days of launch while keeping answer escalation paths clear.`
  ),
  project(
    "proj-legaldoc",
    "LegalDoc Summarizer",
    {
      client: "Apex Legal Partners",
      phase: "Discovery",
      owner: "Devika Arora",
      health: "Amber",
      priority: "Medium",
      dueDate: "2026-09-05",
      budgetInr: 1320000,
      progress: 28,
      risk: "Matter confidentiality rules need sign-off before sample documents can be processed."
    },
    `Objective: Create a secure assistant that summarizes contracts, flags non-standard clauses, and prepares partner review notes.

Scope: PDF parsing, clause extraction, comparison against firm playbooks, matter-level permissions, and exportable review summaries.

Data sources: NDA samples, master service agreements, redline examples, clause library, and partner review memos.

Current status: Discovery calls identified three priority document types. The legal team is preparing sanitized samples for evaluation.

Success metric: Cut first-pass contract review time by 30 percent without reducing partner control over final wording.`
  ),
  project(
    "proj-invoice-agent",
    "Invoice Intelligence Agent",
    {
      client: "FinTrust Capital",
      phase: "QA",
      owner: "Imran Qureshi",
      health: "Green",
      priority: "High",
      dueDate: "2026-07-22",
      budgetInr: 2100000,
      progress: 81,
      risk: "Vendor invoice formats change frequently and need monitoring."
    },
    `Objective: Automate invoice intake, entity extraction, approval routing, duplicate detection, and finance team exception review.

Scope: OCR-assisted ingestion, structured extraction, confidence scoring, ERP-ready export files, and finance dashboard queues.

Data sources: Vendor invoices, purchase orders, payment terms, tax IDs, and historical rejection reasons.

Current status: Extraction accuracy is strong on recurring vendors. QA is focused on edge cases, handwritten notes, and tax field mismatches.

Success metric: Process 70 percent of incoming invoices without manual re-keying while preserving human approval checkpoints.`
  ),
  project(
    "proj-retail-forecast",
    "Retail Demand Forecaster",
    {
      client: "Nova Retail Labs",
      phase: "Prototype",
      owner: "Nikhil Verma",
      health: "Amber",
      priority: "High",
      dueDate: "2026-10-01",
      budgetInr: 2450000,
      progress: 36,
      risk: "Sales history is uneven across regions, which may affect forecast confidence."
    },
    `Objective: Forecast demand for high-velocity retail SKUs and explain what is driving changes in predicted demand.

Scope: Sales data normalization, seasonal feature engineering, campaign event tracking, forecast dashboard, and store-level recommendations.

Data sources: POS exports, campaign calendars, inventory records, weather markers, and regional holiday schedules.

Current status: Baseline models are producing stable weekly forecasts. The next sprint adds explainability and stockout detection.

Success metric: Improve replenishment planning accuracy by 18 percent across pilot categories.`
  ),
  project(
    "proj-clinic-voice",
    "Clinic Voice Notes SLM",
    {
      client: "MediCore Clinics",
      phase: "Build",
      owner: "Rohan Iyer",
      health: "Green",
      priority: "High",
      dueDate: "2026-08-30",
      budgetInr: 1980000,
      progress: 57,
      risk: "Medical abbreviations vary by doctor and need a custom validation loop."
    },
    `Objective: Convert doctor-patient conversations into structured visit notes, follow-up tasks, and patient-friendly summaries.

Scope: Audio transcript cleanup, speciality-aware summarization, review-before-save workflow, and export into clinic systems.

Data sources: Sample transcripts, speciality templates, doctor note examples, medication lists, and follow-up protocols.

Current status: The summarizer is usable for general medicine and dermatology pilots. Accuracy testing is underway with doctor feedback.

Success metric: Save each doctor 6 to 8 minutes per consultation note while keeping final approval with the doctor.`
  ),
  project(
    "proj-sales-intel",
    "Sales Meeting Intelligence",
    {
      client: "UrbanKart Commerce",
      phase: "Pilot",
      owner: "Priya Nair",
      health: "Green",
      priority: "Medium",
      dueDate: "2026-07-31",
      budgetInr: 1250000,
      progress: 70,
      risk: "Adoption depends on sales managers enforcing clean next-step ownership."
    },
    `Objective: Turn sales calls into account summaries, objections, buying signals, follow-up tasks, and CRM updates.

Scope: Transcript ingestion, account timeline, action extraction, deal risk scoring, and weekly manager digest.

Data sources: Call transcripts, CRM notes, proposal history, sales playbook, and product pricing sheets.

Current status: Pilot users are receiving meeting summaries within five minutes of upload. Next focus is automatic deal stage suggestions.

Success metric: Improve follow-up completion and forecast accuracy across the pilot sales pod.`
  ),
  project(
    "proj-support-autopilot",
    "Support Autopilot",
    {
      client: "LearnSphere EdTech",
      phase: "Discovery",
      owner: "Sanjay Rao",
      health: "Amber",
      priority: "Medium",
      dueDate: "2026-09-18",
      budgetInr: 1560000,
      progress: 22,
      risk: "Support taxonomy is inconsistent and needs cleanup before automation."
    },
    `Objective: Answer repetitive support questions, recommend help articles, and draft escalation summaries for agents.

Scope: Knowledge base cleanup, intent classification, escalation rules, human handoff, and quality review dashboards.

Data sources: Zendesk exports, help center articles, product release notes, refund policy, and historical escalations.

Current status: Discovery found high-volume categories around login, billing, and course access. Data cleanup is the critical path.

Success metric: Deflect 35 percent of low-complexity tickets while improving escalation context quality.`
  ),
  project(
    "proj-compliance-brain",
    "Compliance Knowledge Brain",
    {
      client: "FinTrust Capital",
      phase: "Build",
      owner: "Nikhil Verma",
      health: "Green",
      priority: "High",
      dueDate: "2026-09-10",
      budgetInr: 2750000,
      progress: 49,
      risk: "Answers must cite policy sections and avoid unsupported interpretations."
    },
    `Objective: Give compliance teams a trusted assistant for policy lookup, control evidence, audit preparation, and internal procedure questions.

Scope: Document versioning, retrieval with citations, source-aware answer generation, approval workflow, and audit evidence packs.

Data sources: Compliance manuals, internal SOPs, RBI circular notes, audit observations, and policy exception registers.

Current status: Version-aware document ingestion is complete. The team is testing citation precision across long policy documents.

Success metric: Reduce compliance lookup time by 50 percent and improve audit preparation consistency.`
  ),
  project(
    "proj-founder-ops",
    "Founder Ops Copilot",
    {
      client: "Internal - Enxt AI",
      phase: "Prototype",
      owner: "Aisha Menon",
      health: "Green",
      priority: "High",
      dueDate: "2026-07-15",
      budgetInr: 900000,
      progress: 44,
      risk: "Founder-level write access must be protected with explicit review and audit trails."
    },
    `Objective: Give the founder a single chat interface to ask about employees, projects, clients, leads, payroll, risks, and operating priorities.

Scope: Document-native company memory, CRM views, employee records, project docs, answer grounding, AI edit proposals, and approval-based document mutation.

Data sources: Employee documents, project docs, CRM notes, meeting summaries, founder memos, and future Google Sheet imports.

Current status: Demo corpus and dashboard shell are being created first. Real ingestion, auth, Pinecone, and database persistence follow after the MVP UX is validated.

Success metric: The founder can ask operational questions and update company records from one clean workspace.`
  ),
  project(
    "proj-lead-scoring",
    "Lead Scoring Engine",
    {
      client: "Internal - Enxt AI",
      phase: "Planning",
      owner: "Priya Nair",
      health: "Green",
      priority: "Medium",
      dueDate: "2026-08-20",
      budgetInr: 650000,
      progress: 18,
      risk: "Lead quality signals are currently subjective and need consistent definitions."
    },
    `Objective: Rank inbound and outbound leads by fit, urgency, budget signals, and similarity to successful clients.

Scope: CRM field design, lead source tracking, score explanation, sales next-best action, and weekly founder pipeline digest.

Data sources: Lead documents, proposal history, won/lost notes, website forms, meeting transcripts, and email summaries.

Current status: Planning is focused on defining scoring signals and avoiding black-box sales prioritization.

Success metric: Help sales spend more time on the top 20 percent of opportunities and improve proposal-to-close conversion.`
  ),
  client(
    "client-nova-retail",
    "Nova Retail Labs",
    {
      company: "Nova Retail Labs",
      industry: "Retail",
      relationshipStage: "Active Client",
      health: "Green",
      accountOwner: "Sanjay Rao",
      primaryContact: "Suresh Kumar, COO",
      annualValueInr: 4800000,
      renewalDate: "2027-02-28",
      openProjects: ["TalentPulse HR Copilot", "Retail Demand Forecaster"],
      nextAction: "Send combined pilot success dashboard before Friday review."
    },
    `Nova Retail Labs is a strategic retail client with two active AI programs. The account has strong executive sponsorship and a healthy expansion path if the demand forecasting pilot proves ROI. Current relationship tone is collaborative and fast-moving.`
  ),
  client(
    "client-medicore",
    "MediCore Clinics",
    {
      company: "MediCore Clinics",
      industry: "Healthcare",
      relationshipStage: "Onboarding",
      health: "Green",
      accountOwner: "Sanjay Rao",
      primaryContact: "Dr. Neha Raman, Medical Director",
      annualValueInr: 3600000,
      renewalDate: "2027-04-15",
      openProjects: ["Clinic Voice Notes SLM"],
      nextAction: "Collect doctor feedback from the dermatology pilot group."
    },
    `MediCore Clinics wants practical AI that saves doctor time without weakening clinical control. Data sensitivity is high, so all product discussions should emphasize review-before-save, auditability, and doctor approval.`
  ),
  client(
    "client-apex-legal",
    "Apex Legal Partners",
    {
      company: "Apex Legal Partners",
      industry: "Legal",
      relationshipStage: "Discovery",
      health: "Amber",
      accountOwner: "Priya Nair",
      primaryContact: "Ananya Deshpande, Partner",
      annualValueInr: 2200000,
      renewalDate: "2027-01-31",
      openProjects: ["LegalDoc Summarizer"],
      nextAction: "Get sanitized contract samples and confidentiality approval."
    },
    `Apex Legal Partners is interested but cautious. The buying committee needs confidence that AI output will support lawyers rather than replace partner judgment. Confidentiality and source traceability are the two strongest concerns.`
  ),
  client(
    "client-fintrust",
    "FinTrust Capital",
    {
      company: "FinTrust Capital",
      industry: "Financial Services",
      relationshipStage: "Active Client",
      health: "Green",
      accountOwner: "Sanjay Rao",
      primaryContact: "Vikram Bhatt, CFO",
      annualValueInr: 6200000,
      renewalDate: "2027-03-20",
      openProjects: ["Invoice Intelligence Agent", "Compliance Knowledge Brain"],
      nextAction: "Prepare QA report for invoice extraction and policy citation tests."
    },
    `FinTrust Capital is the highest-value active account. They care about controls, evidence, and operational efficiency. The relationship is strong, but every AI answer must be defensible and tied to source documents.`
  ),
  client(
    "client-learnsphere",
    "LearnSphere EdTech",
    {
      company: "LearnSphere EdTech",
      industry: "Education",
      relationshipStage: "Discovery",
      health: "Amber",
      accountOwner: "Priya Nair",
      primaryContact: "Ritika Shah, Head of Support",
      annualValueInr: 1800000,
      renewalDate: "2027-05-30",
      openProjects: ["Support Autopilot"],
      nextAction: "Complete support taxonomy cleanup plan."
    },
    `LearnSphere has a clear support automation need but messy source data. The opportunity can grow if the first phase improves support deflection without creating low-quality automated responses.`
  ),
  client(
    "client-urbankart",
    "UrbanKart Commerce",
    {
      company: "UrbanKart Commerce",
      industry: "E-commerce",
      relationshipStage: "Pilot",
      health: "Green",
      accountOwner: "Sanjay Rao",
      primaryContact: "Arjun Mehta, VP Sales",
      annualValueInr: 2400000,
      renewalDate: "2027-06-10",
      openProjects: ["Sales Meeting Intelligence"],
      nextAction: "Review pilot adoption with sales managers."
    },
    `UrbanKart is piloting sales intelligence for account teams. The buyer values manager visibility and better follow-up discipline. The main risk is inconsistent sales rep usage.`
  ),
  lead(
    "lead-banyan-health",
    "Banyan Health Systems",
    {
      company: "Banyan Health Systems",
      stage: "Qualified",
      owner: "Priya Nair",
      source: "Founder Referral",
      potentialValueInr: 3200000,
      probability: 48,
      contact: "Rahul Sethi, CTO",
      interest: "Patient support assistant and internal policy search",
      nextAction: "Schedule workflow mapping call with operations head."
    },
    `Banyan Health Systems is exploring AI for patient service workflows. They have budget but need a clear privacy posture and a practical first use case. Strong fit for healthcare SLM patterns from MediCore.`
  ),
  lead(
    "lead-orbit-logistics",
    "Orbit Logistics",
    {
      company: "Orbit Logistics",
      stage: "New",
      owner: "Priya Nair",
      source: "Website",
      potentialValueInr: 1900000,
      probability: 22,
      contact: "Maya Thomas, Head of Ops",
      interest: "Shipment exception summarization",
      nextAction: "Qualify data availability and decision timeline."
    },
    `Orbit Logistics submitted a website inquiry about summarizing shipment exceptions and routing them to operations teams. Needs qualification before proposal work.`
  ),
  lead(
    "lead-saffron-bank",
    "Saffron Bank",
    {
      company: "Saffron Bank",
      stage: "Proposal",
      owner: "Founder",
      source: "Partner",
      potentialValueInr: 5400000,
      probability: 41,
      contact: "Dev Malhotra, Digital Transformation Lead",
      interest: "Compliance and branch knowledge assistant",
      nextAction: "Send source-citation architecture and security summary."
    },
    `Saffron Bank is a high-value regulated opportunity. The proposal should emphasize controlled retrieval, audit logs, data residency options, and human approval for operational changes.`
  ),
  lead(
    "lead-craftlane",
    "CraftLane Market",
    {
      company: "CraftLane Market",
      stage: "Qualified",
      owner: "Priya Nair",
      source: "LinkedIn",
      potentialValueInr: 1400000,
      probability: 35,
      contact: "Ira Khanna, Founder",
      interest: "Seller support automation",
      nextAction: "Share two-phase support automation estimate."
    },
    `CraftLane is an early-stage marketplace with growing seller support volume. Budget is moderate, but the buying cycle may be short if ROI is clear.`
  ),
  lead(
    "lead-vectorfoods",
    "VectorFoods",
    {
      company: "VectorFoods",
      stage: "Negotiation",
      owner: "Founder",
      source: "Outbound",
      potentialValueInr: 2800000,
      probability: 57,
      contact: "Kabir Rao, COO",
      interest: "Demand planning and procurement signals",
      nextAction: "Clarify procurement integration cost."
    },
    `VectorFoods has a serious demand planning need and is comparing Enxt AI with a traditional analytics vendor. Win path depends on speed, explainability, and lower implementation burden.`
  ),
  lead(
    "lead-eduloop",
    "EduLoop Academy",
    {
      company: "EduLoop Academy",
      stage: "New",
      owner: "Priya Nair",
      source: "Event",
      potentialValueInr: 950000,
      probability: 18,
      contact: "Sneha Jain, Program Director",
      interest: "Student query assistant",
      nextAction: "Qualify number of monthly student queries."
    },
    `EduLoop is a smaller education lead. The opportunity may be best served with a packaged support assistant rather than a heavy custom build.`
  ),
  lead(
    "lead-onyx-realty",
    "Onyx Realty Group",
    {
      company: "Onyx Realty Group",
      stage: "Qualified",
      owner: "Priya Nair",
      source: "Referral",
      potentialValueInr: 1700000,
      probability: 32,
      contact: "Varun Nanda, Sales Director",
      interest: "Lead qualification and project FAQ bot",
      nextAction: "Request sample buyer inquiries and brochure PDFs."
    },
    `Onyx Realty wants faster buyer qualification and property information answers. Good fit for retrieval over brochures, pricing sheets, and sales FAQs.`
  ),
  lead(
    "lead-pulse-insurance",
    "Pulse Insurance",
    {
      company: "Pulse Insurance",
      stage: "Proposal",
      owner: "Founder",
      source: "Founder Network",
      potentialValueInr: 4600000,
      probability: 44,
      contact: "Nitin Bose, Claims Head",
      interest: "Claims triage and document summarization",
      nextAction: "Prepare phased rollout with risk controls."
    },
    `Pulse Insurance has a strong operations pain around claims triage. The proposal should lead with human-in-the-loop review and measurable cycle time reduction.`
  ),
  lead(
    "lead-kitehr",
    "KiteHR",
    {
      company: "KiteHR",
      stage: "Nurture",
      owner: "Priya Nair",
      source: "Content",
      potentialValueInr: 1200000,
      probability: 16,
      contact: "Alok Verma, Product Lead",
      interest: "Embedded HR assistant",
      nextAction: "Send product integration questions next month."
    },
    `KiteHR is interested in an embedded assistant but does not have an urgent purchase timeline. Keep warm with product-led integration material.`
  ),
  lead(
    "lead-riverline",
    "Riverline Manufacturing",
    {
      company: "Riverline Manufacturing",
      stage: "Qualified",
      owner: "Founder",
      source: "Outbound",
      potentialValueInr: 3600000,
      probability: 39,
      contact: "Manasi Kulkarni, Plant Systems Lead",
      interest: "Maintenance knowledge brain",
      nextAction: "Collect maintenance SOPs and downtime categories."
    },
    `Riverline wants plant technicians to ask questions over maintenance SOPs and machine manuals. Needs offline-friendly deployment discussion and clear permissioning.`
  ),
  {
    id: "system-enxt-brain-architecture",
    type: "system",
    title: "Enxt Brain Architecture Note",
    status: "Draft",
    owner: "Founder Office",
    updatedAt: today,
    tags: ["architecture", "pinecone", "document-store", "write-mode"],
    fields: {
      product: "Enxt Brain",
      principle: "Documents are the source of truth",
      futureVectorDb: "Pinecone",
      aiWritePolicy: "Proposal, review, approval, audit"
    },
    body: `Enxt Brain is a document-native company brain. Employees, projects, clients, leads, policies, meetings, and founder notes should all exist as documents with structured metadata.

The UI can present these documents as CRM boards, employee tables, project dashboards, and chat context. The AI layer should retrieve relevant documents, answer with citations, and propose edits when write mode is enabled.

AI writes should not silently mutate company memory. The safe workflow is: identify target documents, draft a change, show a human-readable diff, request founder approval, save the new document version, embed the updated content into Pinecone, and log the event.`
  }
];

export const initialMockSubscriptions: BrainDocument[] = [
  {
    id: "sub-openai",
    type: "subscription",
    title: "OpenAI API",
    status: "Active",
    owner: "Rohan Iyer",
    updatedAt: today,
    tags: ["subscription", "AI Tools", "Active"],
    fields: {
      serviceName: "OpenAI API",
      vendor: "OpenAI Inc.",
      website: "https://openai.com",
      category: "AI Tools",
      description: "LLM API access for GPT-4o, GPT-4, and embeddings for Enxt Brain product development.",
      billingCycle: "Monthly",
      currency: "USD",
      cost: 850,
      tax: 0,
      totalAmount: 850,
      purchaseDate: "2025-01-15",
      startDate: "2025-01-15",
      renewalDate: "2026-07-28",
      owner: "Rohan Iyer",
      department: "Engineering",
      paymentMethod: "Corporate Visa - 4821",
      billingEmail: "engineering@enxt.ai",
      autoRenewal: true,
      status: "Active"
    },
    body: "LLM API access for GPT-4o, GPT-4, and embeddings for Enxt Brain product development."
  },
  {
    id: "sub-higgsfield",
    type: "subscription",
    title: "Higgsfield AI",
    status: "Due Soon",
    owner: "Priya Nair",
    updatedAt: today,
    tags: ["subscription", "AI Tools", "Due Soon"],
    fields: {
      serviceName: "Higgsfield AI",
      vendor: "Higgsfield Inc.",
      website: "https://higgsfield.ai",
      category: "AI Tools",
      description: "Video generation models license for social marketing and AI research.",
      billingCycle: "Monthly",
      currency: "USD",
      cost: 250,
      tax: 0,
      totalAmount: 250,
      purchaseDate: "2025-03-10",
      startDate: "2025-03-10",
      renewalDate: "2026-07-24",
      owner: "Priya Nair",
      department: "Marketing",
      paymentMethod: "Corporate Visa - 4821",
      billingEmail: "marketing@enxt.ai",
      autoRenewal: true,
      status: "Due Soon"
    },
    body: "Video generation models license for social marketing and AI research."
  },
  {
    id: "sub-vercel",
    type: "subscription",
    title: "Vercel Pro",
    status: "Expired",
    owner: "Rohan Iyer",
    updatedAt: today,
    tags: ["subscription", "Cloud Hosting", "Expired"],
    fields: {
      serviceName: "Vercel Pro",
      vendor: "Vercel Inc.",
      website: "https://vercel.com",
      category: "Cloud Hosting",
      description: "Production hosting and serverless functions deployment platform for customer apps.",
      billingCycle: "Monthly",
      currency: "USD",
      cost: 40,
      tax: 0,
      totalAmount: 40,
      purchaseDate: "2024-06-05",
      startDate: "2024-06-05",
      renewalDate: "2026-07-05",
      owner: "Rohan Iyer",
      department: "Engineering",
      paymentMethod: "Corporate Visa - 4821",
      billingEmail: "finance@enxt.ai",
      autoRenewal: false,
      status: "Expired"
    },
    body: "Production hosting and serverless functions deployment platform for customer apps."
  },
  {
    id: "sub-google-workspace",
    type: "subscription",
    title: "Google Workspace",
    status: "Renewal Needed",
    owner: "Aisha Menon",
    updatedAt: today,
    tags: ["subscription", "Communication", "Renewal Needed"],
    fields: {
      serviceName: "Google Workspace",
      vendor: "Google LLC",
      website: "https://workspace.google.com",
      category: "Communication",
      description: "Enterprise email, Google Drive cloud storage, and office suite for all active employees.",
      billingCycle: "Monthly",
      currency: "INR",
      cost: 12800,
      tax: 2304,
      totalAmount: 15104,
      purchaseDate: "2023-11-20",
      startDate: "2023-11-20",
      renewalDate: "2026-07-20",
      owner: "Aisha Menon",
      department: "HR & Admin",
      paymentMethod: "Auto Debit - HDFC Bank",
      billingEmail: "hr@enxt.ai",
      autoRenewal: true,
      status: "Renewal Needed"
    },
    body: "Enterprise email, Google Drive cloud storage, and office suite for all active employees."
  },
  {
    id: "sub-supabase",
    type: "subscription",
    title: "Supabase Pro",
    status: "Active",
    owner: "Rohan Iyer",
    updatedAt: today,
    tags: ["subscription", "Cloud Hosting", "Active"],
    fields: {
      serviceName: "Supabase Pro",
      vendor: "Supabase Inc.",
      website: "https://supabase.com",
      category: "Cloud Hosting",
      description: "Managed Postgres database, authentication, and object storage buckets for app backends.",
      billingCycle: "Monthly",
      currency: "USD",
      cost: 25,
      tax: 0,
      totalAmount: 25,
      purchaseDate: "2024-08-12",
      startDate: "2024-08-12",
      renewalDate: "2026-08-12",
      owner: "Rohan Iyer",
      department: "Engineering",
      paymentMethod: "Corporate Visa - 4821",
      billingEmail: "engineering@enxt.ai",
      autoRenewal: true,
      status: "Active"
    },
    body: "Managed Postgres database, authentication, and object storage buckets for app backends."
  }
];

export const brainDocuments: BrainDocument[] = [
  ...baseBrainDocuments.filter((document) => document.type !== "client" && document.type !== "lead"),
  ...sheetLeadDocuments,
  ...initialMockSubscriptions
];

export const getDocumentsByType = (type: BrainDocument["type"], documents = brainDocuments) =>
  documents.filter((document) => document.type === type);
