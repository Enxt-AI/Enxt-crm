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
  { serialNo: 1, company: "Avaada", contactPerson: "Pooja Patwari", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Already had AI Depratment, not intrested in our solution", nextSteps: "Pitch in Future, if we create products that they might need", deadline: "NA", lastCommunicationDate: "2025-10-21", stage: "Nurture", potentialValueInr: 0 },
  { serialNo: 2, company: "Rocker Boy", contactPerson: "Madhu Ma'am", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "No Update, Follow Ups", nextSteps: "Complete the company profile with menu,cards and website", deadline: "NA", lastCommunicationDate: "2025-11-27", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 3, company: "CA Firm", contactPerson: "Pawan Gupta", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "First Meeting", nextSteps: "Make Whatsapp PA bot for reporting of employees,", deadline: "NA", lastCommunicationDate: "2025-10-21", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 4, company: "WealthKare", contactPerson: "Mukesh Gupta", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Email Regardin our services sent, initial 2 meetings done", nextSteps: "Mailed them for follow up", deadline: "NA", lastCommunicationDate: "2025-11-28", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 5, company: "BioAide", contactPerson: "Vijay Goel", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Initial Meeting Done, Sir told to wait until plan is ready", nextSteps: "Final Mail and communication", deadline: "NA", lastCommunicationDate: "2025-12-01", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 6, company: "Ad Factors", contactPerson: "Varun Pal", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Initial Meeting Done to understand problem", nextSteps: "Create Examples and creatives for social media, Publish and check cost of Model with the IPO knowledge base", deadline: "NA", lastCommunicationDate: "2025-10-24", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 7, company: "Nitin Sir", contactPerson: "Nitin Sir", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Made New Trailer for Book", nextSteps: "Meeting with Sam, next thurday", deadline: "2025-12-22", lastCommunicationDate: "2025-12-18", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 8, company: "Sawan Kumar", contactPerson: "Sawan Kumar", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "First Demo Shared", nextSteps: "Changes in Demo", deadline: "2025-12-22", lastCommunicationDate: "2025-12-17", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 9, company: "Jain Ratna", contactPerson: "Lalit Saroagi", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Pilot Video Sent", nextSteps: "Waiting for video", deadline: "2025-12-22", lastCommunicationDate: "2025-12-19", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 10, company: "Filmmaker", contactPerson: "Mr Kapil - Mumbai", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 11, company: "Helping Hands", contactPerson: "Robin Hibu", projectDetails: "", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "First Demo Ready", nextSteps: "Finalize and share", deadline: "2025-12-22", lastCommunicationDate: "2025-12-21", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 12, company: "Humain Learning", contactPerson: "Chandan", projectDetails: "Ai Videos", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 13, company: "Swati Clean Skies", contactPerson: "Muulraj", projectDetails: "Ai Videos", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 14, company: "Suresh Mutreja", contactPerson: "Suresh Mutreja", projectDetails: "Ai Videos", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 15, company: "Trans Curaters", contactPerson: "Harjas Kaur", projectDetails: "AI Videos", contractValue: "", charge: "Proposed 1,600 Per minute", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Sent 2 Pilot Videos", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 16, company: "SMC PMS Tracking", contactPerson: "Vishal Rai", projectDetails: "Trading Platform", contractValue: "Proposed 1,50,000", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Qoutation Sent", nextSteps: "Changes in Plan and Execution Strategy", deadline: "2025-12-26", lastCommunicationDate: "2025-12-18", stage: "Proposal", potentialValueInr: 150000 },
  { serialNo: 17, company: "NAM Securities", contactPerson: "Ashwani Goyal", projectDetails: "Ai Videos, Trading Platform", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 18, company: "Sunil Aggarwal", contactPerson: "Sunil Aggarwal", projectDetails: "Movie Project", contractValue: "Proposed 15,00,000", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 1500000 },
  { serialNo: 19, company: "MS Wealth - MF App", contactPerson: "Vinod Sir", projectDetails: "Trading Platform", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 20, company: "STIC", contactPerson: "Subhash Goyal", projectDetails: "AI Integration", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Proposed Multiple Services", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 21, company: "Raftar Filmcity", contactPerson: "Ram Guruji", projectDetails: "Short Film + Brochure", contractValue: "1,00,000 + 80,000", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Pilot Videos Sent", nextSteps: "Setup Meeting", deadline: "", lastCommunicationDate: "2026-04-24", stage: "Contacted", potentialValueInr: 180000 },
  { serialNo: 22, company: "Mozno", contactPerson: "Vivek Jain", projectDetails: "AI Workflow, AI Videos", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "Propsoal Sent, Pilot Video Sent,", nextSteps: "", deadline: "", lastCommunicationDate: "2026-04-23", stage: "Contacted", potentialValueInr: 0 },
  { serialNo: 23, company: "Connect Ventures", contactPerson: "Anil Gupta", projectDetails: "AI Reels", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 24, company: "Raghavenddhiraa", contactPerson: "Raghavenddhiraa", projectDetails: "Ministry talk", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 25, company: "ILeadTV", contactPerson: "Pradip Chopra", projectDetails: "Ai Avatar Reels", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "", communicationStatus: "", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "New", potentialValueInr: 0 },
  { serialNo: 26, company: "Chirag Kothari", contactPerson: "Chirag Kothari", projectDetails: "AI Memorial Video", contractValue: "6000", charge: "2,500 per min", paymentDue: "", paymentReceived: "6000", paymentRemarks: "", contractSignedStatus: "Completed", communicationStatus: "Finished", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Completed", potentialValueInr: 6000 },
  { serialNo: 27, company: "Sharvan Parmar", contactPerson: "Sharvan Parmar", projectDetails: "AI Memorial Video", contractValue: "5500", charge: "1,000 per min", paymentDue: "", paymentReceived: "5500", paymentRemarks: "", contractSignedStatus: "Completed", communicationStatus: "Finished", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Completed", potentialValueInr: 5500 },
  { serialNo: 28, company: "UnlistedZone", contactPerson: "Dinesh Gupta", projectDetails: "SAAS", contractValue: "5000 per month", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "SaaS", communicationStatus: "Started using Batch Solution in prototype", nextSteps: "Integration with thier CRM, Setup a Meeting on monday", deadline: "2026-04-27", lastCommunicationDate: "2026-04-23", stage: "Signed", potentialValueInr: 5000 },
  { serialNo: 29, company: "SMC UnlistedStox", contactPerson: "Vishal Rai", projectDetails: "Trading Platform", contractValue: "4,50,000", charge: "", paymentDue: "1,50,000", paymentReceived: "50000", paymentRemarks: "", contractSignedStatus: "Signed", communicationStatus: "Waiting for APIs", nextSteps: "Ask for Payment og Milestones", deadline: "2026-04-30", lastCommunicationDate: "2026-04-24", stage: "Signed", potentialValueInr: 450000 },
  { serialNo: 30, company: "Trans Curaters", contactPerson: "Paras", projectDetails: "150 Videos", contractValue: "3,00,000", charge: "2000 Per Video", paymentDue: "1,30,000", paymentReceived: "1,10,000", paymentRemarks: "", contractSignedStatus: "E-Signed", communicationStatus: "Phase 3 Bill Raise, Payment Pending - 65 Videos Total Completed - 120 Vidoes", nextSteps: "Wait For Ultra, Bill Raise", deadline: "2026-04-24", lastCommunicationDate: "2026-04-30", stage: "Signed", potentialValueInr: 300000 },
  { serialNo: 31, company: "MS Wealth - Edu. Videos", contactPerson: "Vinod Sir", projectDetails: "104 Videos", contractValue: "1,04,000", charge: "1000 Per VIdeo", paymentDue: "16000", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Sent", communicationStatus: "Video 2 Ready , Sir creating email ID, 1 video per day", nextSteps: "Finalized tool, Fixes on Videos 3,4 also Complete, Send Qoutation, ask for new content", deadline: "2025-12-22", lastCommunicationDate: "2025-12-21", stage: "Proposal", potentialValueInr: 104000 },
  { serialNo: 32, company: "Unicentral", contactPerson: "Satvik Bansal", projectDetails: "Social Platform", contractValue: "40000", charge: "", paymentDue: "", paymentReceived: "20000", paymentRemarks: "", contractSignedStatus: "E-Signed", communicationStatus: "Half Project Complete", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Signed", potentialValueInr: 40000 },
  { serialNo: 33, company: "Mahavir Jindal", contactPerson: "Mahavir Jindal", projectDetails: "Patnership, AI Marketplace", contractValue: "", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Signed", communicationStatus: "Co-pitching to clients", nextSteps: "", deadline: "", lastCommunicationDate: "", stage: "Signed", potentialValueInr: 0 },
  { serialNo: 34, company: "Naveen Sharma", contactPerson: "Naveen Sharma", projectDetails: "Ai Videos, News Channel ( 2 Videos )", contractValue: "", charge: "2000 per min", paymentDue: "1 Video + 4 News", paymentReceived: "12333", paymentRemarks: "", contractSignedStatus: "Sent", communicationStatus: "Start a News Channel, Daily 2 videos", nextSteps: "Make a Perfect Format for News Videos", deadline: "", lastCommunicationDate: "2026-04-24", stage: "Proposal", potentialValueInr: 5 },
  { serialNo: 35, company: "LegalDoc360", contactPerson: "Anand Singh", projectDetails: "Daily videos", contractValue: "", charge: "2000 per min", paymentDue: "2 Videos", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Sent", communicationStatus: "Start Social Media Reels Daily", nextSteps: "Scirpts Finalize, Send Logo Options", deadline: "2026-04-26", lastCommunicationDate: "2026-04-24", stage: "Proposal", potentialValueInr: 2 },
  { serialNo: 36, company: "Sunaina", contactPerson: "Sunaina", projectDetails: "Develop Welness Pods", contractValue: "TBD", charge: "", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Not Signed", communicationStatus: "Developed Prototype, Ordered VR", nextSteps: "Better the AI, Make Envoirnments", deadline: "2026-04-30", lastCommunicationDate: "2026-04-25", stage: "Signed", potentialValueInr: 0 },
  { serialNo: 37, company: "HJ Unicare", contactPerson: "Gurivinder Singh", projectDetails: "AI Videos, Digital Media", contractValue: "", charge: "4000 per min", paymentDue: "4 Videos", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Not Signed", communicationStatus: "Adding Subtitiles", nextSteps: "Finalize Videos", deadline: "2026-04-30", lastCommunicationDate: "2026-04-25", stage: "Signed", potentialValueInr: 4 },
  { serialNo: 38, company: "Numax", contactPerson: "Sanjay Aggarwal", projectDetails: "2 Videos Every week", contractValue: "", charge: "3000 per min", paymentDue: "22500", paymentReceived: "", paymentRemarks: "Bill Raised", contractSignedStatus: "Sent", communicationStatus: "Trying to Pitch Smart Homes", nextSteps: "Make New Video", deadline: "", lastCommunicationDate: "2026-04-23", stage: "Proposal", potentialValueInr: 22500 },
  { serialNo: 39, company: "MS Wealth - Avatar", contactPerson: "Vinod Sir", projectDetails: "Daily 4 Avatar Reels", contractValue: "75,600 per month", charge: "630 per video", paymentDue: "", paymentReceived: "", paymentRemarks: "", contractSignedStatus: "Not Signed", communicationStatus: "Create Pilots, Avatar Training Done", nextSteps: "Send Pilots", deadline: "", lastCommunicationDate: "", stage: "Signed", potentialValueInr: 75600 },
  { serialNo: 40, company: "Garima Goyal", contactPerson: "Garima Goyal", projectDetails: "Website", contractValue: "25000", charge: "", paymentDue: "", paymentReceived: "15000", paymentRemarks: "", contractSignedStatus: "Signed", communicationStatus: "", nextSteps: "Work Going", deadline: "", lastCommunicationDate: "", stage: "Signed", potentialValueInr: 25000 },
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
      nextAction: lead.nextSteps
    },
    body: `Imported lead from Client Communications sheet.

Company: ${lead.company}
Contact: ${lead.contactPerson || "Not provided"}
Project: ${lead.projectDetails || "Not provided"}
Contract value: ${lead.contractValue || "Not provided"}
Cess: ${lead.cess || lead.charge || "Not provided"}
Payment due: ${lead.paymentDue || "Not provided"}
Payment received: ${lead.paymentReceived || "Not provided"}
Contract signed status: ${lead.contractSignedStatus || "Not provided"}
Communication status: ${lead.communicationStatus || "Not provided"}
Next steps: ${lead.nextSteps || "Not provided"}
Deadline: ${lead.deadline || "Not provided"}
Last communication: ${lead.lastCommunicationDate || "Not provided"}`
  };
});
