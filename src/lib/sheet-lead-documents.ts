import type { BrainDocument } from "./types";

const today = "2026-06-17";

type SheetLead = {
  serialNo: number;
  company: string;
  contactPerson: string;
  projectDetails: string;
  contractValue: string;
  cess?: string;
  charge?: string;
  paymentDue: string;
  paymentReceived: string;
  paymentRemarks: string;
  contractSignedStatus: string;
  communicationStatus: string;
  nextSteps: string;
  deadline: string;
  lastCommunicationDate: string;
  stage: string;
  potentialValueInr: number;
};

const leads: SheetLead[] = [
  {
    serialNo: 1,
    company: "Acme Corp",
    contactPerson: "John Doe",
    projectDetails: "AI Chatbot Integration",
    contractValue: "Proposed 5,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "First Meeting done. John is interested in customer service automation.",
    nextSteps: "Send commercial proposal by next Friday.",
    deadline: "2026-06-30",
    lastCommunicationDate: "2026-06-10",
    stage: "Contacted",
    potentialValueInr: 500000
  },
  {
    serialNo: 2,
    company: "Globex Corporation",
    contactPerson: "Hank Scorpio",
    projectDetails: "Custom LLM Finetuning",
    contractValue: "Proposed 15,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Initial call successful. Shared LLM evaluation details.",
    nextSteps: "Schedule technical walkthrough session.",
    deadline: "2026-07-15",
    lastCommunicationDate: "2026-06-12",
    stage: "Proposal",
    potentialValueInr: 1500000
  },
  {
    serialNo: 3,
    company: "Initech",
    contactPerson: "Peter Gibbons",
    projectDetails: "TPS Report Automation",
    contractValue: "3,00,000",
    charge: "",
    paymentDue: "1,00,000",
    paymentReceived: "2,00,000",
    paymentRemarks: "Milestone 1 Paid",
    contractSignedStatus: "Signed",
    communicationStatus: "Project ongoing. Milestone 1 successfully completed.",
    nextSteps: "Deliver Milestone 2 (PDF parsing engine).",
    deadline: "2026-06-25",
    lastCommunicationDate: "2026-06-15",
    stage: "Signed",
    potentialValueInr: 300000
  },
  {
    serialNo: 4,
    company: "Umbrella Corp",
    contactPerson: "Albert Wesker",
    projectDetails: "Bio-Metrics Scanner AI",
    contractValue: "8,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "8,00,000",
    paymentRemarks: "Paid in Full",
    contractSignedStatus: "Completed",
    communicationStatus: "Project fully delivered. Handed over deployment keys.",
    nextSteps: "Follow up for maintenance contract.",
    deadline: "2026-05-30",
    lastCommunicationDate: "2026-06-01",
    stage: "Completed",
    potentialValueInr: 800000
  },
  {
    serialNo: 5,
    company: "Hooli",
    contactPerson: "Gavin Belson",
    projectDetails: "Nucleus AI Pipeline",
    contractValue: "12,00,000",
    charge: "",
    paymentDue: "3,00,000",
    paymentReceived: "9,00,000",
    paymentRemarks: "Phase 2 Invoice Sent",
    contractSignedStatus: "Signed",
    communicationStatus: "Integration testing in progress.",
    nextSteps: "Fix QA bugs reported by Hooli team.",
    deadline: "2026-06-28",
    lastCommunicationDate: "2026-06-14",
    stage: "Signed",
    potentialValueInr: 1200000
  },
  {
    serialNo: 6,
    company: "Vehement Capital Partners",
    contactPerson: "Laurie Bream",
    projectDetails: "AI Investment Advisor",
    contractValue: "",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Laurie wants to see case studies on financial forecast models first.",
    nextSteps: "Compile and share portfolio cases.",
    deadline: "NA",
    lastCommunicationDate: "2026-06-05",
    stage: "Nurture",
    potentialValueInr: 0
  },
  {
    serialNo: 7,
    company: "Massive Dynamic",
    contactPerson: "William Bell",
    projectDetails: "Pattern Recognition Models",
    contractValue: "Proposed 9,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Shared quotation for the computer vision subsystem.",
    nextSteps: "Wait for legal review of MSA.",
    deadline: "2026-07-10",
    lastCommunicationDate: "2026-06-11",
    stage: "Proposal",
    potentialValueInr: 900000
  },
  {
    serialNo: 8,
    company: "Wayne Enterprises",
    contactPerson: "Bruce Wayne",
    projectDetails: "Knightwatch Security AI",
    contractValue: "25,00,000",
    charge: "",
    paymentDue: "5,00,000",
    paymentReceived: "20,00,000",
    paymentRemarks: "Final Payment Pending",
    contractSignedStatus: "Signed",
    communicationStatus: "Night vision module live. Custom alert system training in progress.",
    nextSteps: "Conduct final user acceptance test (UAT).",
    deadline: "2026-07-01",
    lastCommunicationDate: "2026-06-16",
    stage: "Signed",
    potentialValueInr: 2500000
  },
  {
    serialNo: 9,
    company: "Stark Industries",
    contactPerson: "Pepper Potts",
    projectDetails: "Jarvis System Upgrade",
    contractValue: "50,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "50,00,000",
    paymentRemarks: "Paid in Full",
    contractSignedStatus: "Completed",
    communicationStatus: "Upgrade deployed successfully to client servers.",
    nextSteps: "Archived project documents.",
    deadline: "2026-05-15",
    lastCommunicationDate: "2026-05-20",
    stage: "Completed",
    potentialValueInr: 5000000
  },
  {
    serialNo: 10,
    company: "Tyrell Corp",
    contactPerson: "Eldon Tyrell",
    projectDetails: "Replicant Vision Model",
    contractValue: "",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Eldon indicated strict hardware constraints for model size.",
    nextSteps: "Prepare a compressed model size feasibility sheet.",
    deadline: "NA",
    lastCommunicationDate: "2026-06-08",
    stage: "Nurture",
    potentialValueInr: 0
  },
  {
    serialNo: 11,
    company: "Cyberdyne Systems",
    contactPerson: "Miles Dyson",
    projectDetails: "Neural Net Processor Opt",
    contractValue: "18,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Initial requirement gathering complete. Miles requested a custom architecture draft.",
    nextSteps: "Send high-level design specification doc.",
    deadline: "2026-07-05",
    lastCommunicationDate: "2026-06-15",
    stage: "Contacted",
    potentialValueInr: 1800000
  },
  {
    serialNo: 12,
    company: "Oscorp",
    contactPerson: "Norman Osborn",
    projectDetails: "Flight Path Stabilizer AI",
    contractValue: "",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "New lead incoming via website submission.",
    nextSteps: "Schedule discovery call.",
    deadline: "2026-06-20",
    lastCommunicationDate: "",
    stage: "New",
    potentialValueInr: 0
  },
  {
    serialNo: 13,
    company: "Gekko & Co",
    contactPerson: "Gordon Gekko",
    projectDetails: "Stock Trend Predictor",
    contractValue: "Proposed 4,50,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Presented initial demo. Gordon requested higher precision rates.",
    nextSteps: "Optimize model hyperparameters and re-share results.",
    deadline: "2026-07-08",
    lastCommunicationDate: "2026-06-13",
    stage: "Proposal",
    potentialValueInr: 450000
  },
  {
    serialNo: 14,
    company: "Sterling Cooper",
    contactPerson: "Don Draper",
    projectDetails: "AI Copywriter Assistant",
    contractValue: "2,00,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "2,00,000",
    paymentRemarks: "Paid",
    contractSignedStatus: "Completed",
    communicationStatus: "Delivered copy generation model. Don was happy with style match.",
    nextSteps: "Check-in after 30 days of usage.",
    deadline: "2026-05-10",
    lastCommunicationDate: "2026-05-12",
    stage: "Completed",
    potentialValueInr: 200000
  },
  {
    serialNo: 15,
    company: "Reynholm Industries",
    contactPerson: "Douglas Reynholm",
    projectDetails: "IT Support Auto-Responder",
    contractValue: "1,50,000",
    charge: "",
    paymentDue: "",
    paymentReceived: "",
    paymentRemarks: "",
    contractSignedStatus: "",
    communicationStatus: "Douglas was enthusiastic. Tech team raised concerns on API integration bounds.",
    nextSteps: "Send API mapping documentation.",
    deadline: "2026-06-28",
    lastCommunicationDate: "2026-06-14",
    stage: "Contacted",
    potentialValueInr: 150000
  }
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const normalizeLeadStage = (stage: string) => {
  if (stage === "Completed") {
    return "Completed";
  }

  if (stage === "Proposal" || stage === "Signed") {
    return "Project Started";
  }

  return "Old Leads";
};

export const sheetLeadDocuments: BrainDocument[] = leads.map((lead) => {
  const stage = normalizeLeadStage(lead.stage);

  return {
    id: `lead-${slugify(lead.company)}-${lead.serialNo}`,
    type: "lead",
    title: lead.company,
    status: stage,
    owner: "Founder Office",
    updatedAt: today,
    tags: ["lead", stage, "sheet-import"],
    fields: {
      ...lead,
      cess: lead.cess || lead.charge || "",
      stage,
      originalStage: lead.stage,
      owner: "Founder",
      source: "Client Communications Sheet",
      probability: stage === "Completed" ? 100 : stage === "Project Started" ? 80 : 20,
      interest: lead.projectDetails,
      notes: lead.communicationStatus,
      valueRaw: lead.contractValue,
      valueInr: lead.potentialValueInr
    },
    body: `Lead profile for ${lead.company}.
    
Contact Person: ${lead.contactPerson}
Current Pipeline Stage: ${lead.stage} (Normalized to ${stage})
Contract Value: ${lead.contractValue || "TBD"}
Estimated Potential Value: ${lead.potentialValueInr.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}

Communication Status:
${lead.communicationStatus}

Next Steps:
${lead.nextSteps || "No next steps defined."}

Target Deadline: ${lead.deadline || "NA"}
Last Contact Date: ${lead.lastCommunicationDate || "Never"}`
  };
});
