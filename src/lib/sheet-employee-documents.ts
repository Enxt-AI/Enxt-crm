import type { BrainDocument } from "./types";

const today = "2026-06-17";

type SheetEmployee = {
  serialNo: number;
  name: string;
  phone?: string;
  dateOfLeaving: string;
  currentSalary: string;
  updatedStipend: string;
  dateOfJoining: string;
  oldStipend: string;
  offerLetter: string;
  panCard: string;
  aadhaarCard: string;
  bankDetails: string;
  paidFebStipend: string;
  paidMarch7: string;
  paidFeb3: string;
  paidMay7: string;
  paidJun5: string;
};

const employees: SheetEmployee[] = [
  {
    serialNo: 1,
    name: "Alice Smith",
    phone: "+91 99999 10001",
    dateOfLeaving: "",
    currentSalary: "35K",
    updatedStipend: "35K",
    dateOfJoining: "15/01/2025",
    oldStipend: "25K",
    offerLetter: "Alice_Offer_Letter.pdf",
    panCard: "Alice_PAN.pdf",
    aadhaarCard: "Alice_Aadhaar.pdf",
    bankDetails: "Alice_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "35000",
    paidFeb3: "25000",
    paidMay7: "35000",
    paidJun5: "35000"
  },
  {
    serialNo: 2,
    name: "Bob Johnson",
    phone: "+91 99999 10002",
    dateOfLeaving: "",
    currentSalary: "40K",
    updatedStipend: "-",
    dateOfJoining: "01/02/2025",
    oldStipend: "40K",
    offerLetter: "Bob_Offer_Letter.pdf",
    panCard: "Bob_PAN.pdf",
    aadhaarCard: "Bob_Aadhaar.pdf",
    bankDetails: "Bob_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "40000",
    paidFeb3: "40000",
    paidMay7: "40000",
    paidJun5: "40000"
  },
  {
    serialNo: 3,
    name: "Charlie Brown",
    phone: "+91 99999 10003",
    dateOfLeaving: "28/02/2026",
    currentSalary: "",
    updatedStipend: "-",
    dateOfJoining: "01/03/2025",
    oldStipend: "15K",
    offerLetter: "Charlie_Offer_Letter.pdf",
    panCard: "Charlie_PAN.pdf",
    aadhaarCard: "Charlie_Aadhaar.pdf",
    bankDetails: "Charlie_Bank_Details",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 4,
    name: "Diana Prince",
    phone: "+91 99999 10004",
    dateOfLeaving: "",
    currentSalary: "50K",
    updatedStipend: "50K",
    dateOfJoining: "10/04/2025",
    oldStipend: "35K",
    offerLetter: "Diana_Offer_Letter.pdf",
    panCard: "Diana_PAN.pdf",
    aadhaarCard: "Diana_Aadhaar.pdf",
    bankDetails: "Diana_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "50000",
    paidFeb3: "35000",
    paidMay7: "50000",
    paidJun5: "50000"
  },
  {
    serialNo: 5,
    name: "Evan Wright",
    phone: "+91 99999 10005",
    dateOfLeaving: "",
    currentSalary: "30K",
    updatedStipend: "30K",
    dateOfJoining: "20/05/2025",
    oldStipend: "20K",
    offerLetter: "Evan_Offer_Letter.pdf",
    panCard: "Evan_PAN.pdf",
    aadhaarCard: "Evan_Aadhaar.pdf",
    bankDetails: "Evan_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "30000",
    paidFeb3: "20000",
    paidMay7: "30000",
    paidJun5: "30000"
  },
  {
    serialNo: 6,
    name: "Fiona Gallagher",
    phone: "+91 99999 10006",
    dateOfLeaving: "",
    currentSalary: "28K",
    updatedStipend: "-",
    dateOfJoining: "01/06/2025",
    oldStipend: "28K",
    offerLetter: "Fiona_Offer_Letter.pdf",
    panCard: "Fiona_PAN.pdf",
    aadhaarCard: "Fiona_Aadhaar.pdf",
    bankDetails: "Fiona_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "28000",
    paidFeb3: "28000",
    paidMay7: "28000",
    paidJun5: "28000"
  },
  {
    serialNo: 7,
    name: "George Costanza",
    phone: "+91 99999 10007",
    dateOfLeaving: "15/03/2026",
    currentSalary: "",
    updatedStipend: "-",
    dateOfJoining: "01/07/2025",
    oldStipend: "20K",
    offerLetter: "George_Offer_Letter.pdf",
    panCard: "George_PAN.pdf",
    aadhaarCard: "George_Aadhaar.pdf",
    bankDetails: "George_Bank_Details",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 8,
    name: "Hannah Abbott",
    phone: "+91 99999 10008",
    dateOfLeaving: "",
    currentSalary: "32K",
    updatedStipend: "32K",
    dateOfJoining: "15/08/2025",
    oldStipend: "22K",
    offerLetter: "Hannah_Offer_Letter.pdf",
    panCard: "Hannah_PAN.pdf",
    aadhaarCard: "Hannah_Aadhaar.pdf",
    bankDetails: "Hannah_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "32000",
    paidFeb3: "22000",
    paidMay7: "32000",
    paidJun5: "32000"
  },
  {
    serialNo: 9,
    name: "Ian Malcolm",
    phone: "+91 99999 10009",
    dateOfLeaving: "",
    currentSalary: "45K",
    updatedStipend: "-",
    dateOfJoining: "01/09/2025",
    oldStipend: "45K",
    offerLetter: "Ian_Offer_Letter.pdf",
    panCard: "Ian_PAN.pdf",
    aadhaarCard: "Ian_Aadhaar.pdf",
    bankDetails: "Ian_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "45000",
    paidFeb3: "45000",
    paidMay7: "45000",
    paidJun5: "45000"
  },
  {
    serialNo: 10,
    name: "Julia Roberts",
    phone: "+91 99999 10010",
    dateOfLeaving: "",
    currentSalary: "38K",
    updatedStipend: "38K",
    dateOfJoining: "10/10/2025",
    oldStipend: "28K",
    offerLetter: "Julia_Offer_Letter.pdf",
    panCard: "Julia_PAN.pdf",
    aadhaarCard: "Julia_Aadhaar.pdf",
    bankDetails: "Julia_Bank_Details",
    paidFebStipend: "Yes",
    paidMarch7: "38000",
    paidFeb3: "28000",
    paidMay7: "38000",
    paidJun5: "38000"
  }
];

const documentUrlBySerial: Record<number, { offerLetterUrl: string; panCardUrl: string; aadhaarCardUrl: string; bankDetailsUrl: string }> = {
  1: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-alice-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-alice-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-alice-aadhaar/view",
    bankDetailsUrl: "https://drive.google.com/file/d/mock-alice-bank/view"
  },
  2: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-bob-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-bob-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-bob-aadhaar/view",
    bankDetailsUrl: "https://drive.google.com/file/d/mock-bob-bank/view"
  },
  3: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-charlie-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-charlie-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-charlie-aadhaar/view",
    bankDetailsUrl: ""
  },
  4: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-diana-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-diana-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-diana-aadhaar/view",
    bankDetailsUrl: ""
  },
  5: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-evan-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-evan-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-evan-aadhaar/view",
    bankDetailsUrl: "https://drive.google.com/file/d/mock-evan-bank/view"
  },
  6: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-fiona-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-fiona-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-fiona-aadhaar/view",
    bankDetailsUrl: ""
  },
  7: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-george-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-george-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-george-aadhaar/view",
    bankDetailsUrl: ""
  },
  8: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-hannah-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-hannah-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-hannah-aadhaar/view",
    bankDetailsUrl: "https://drive.google.com/file/d/mock-hannah-bank/view"
  },
  9: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-ian-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-ian-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-ian-aadhaar/view",
    bankDetailsUrl: ""
  },
  10: {
    offerLetterUrl: "https://drive.google.com/file/d/mock-julia-offer/view",
    panCardUrl: "https://drive.google.com/file/d/mock-julia-pan/view",
    aadhaarCardUrl: "https://drive.google.com/file/d/mock-julia-aadhaar/view",
    bankDetailsUrl: ""
  }
};

const salaryToNumber = (value: string) => {
  const cleaned = value.trim().toLowerCase();

  if (!cleaned || cleaned === "-") {
    return 0;
  }

  if (cleaned.endsWith("k")) {
    return Number(cleaned.replace("k", "")) * 1000;
  }

  return Number(cleaned.replace(/[^0-9.]/g, "")) || 0;
};

const bestSalary = (employee: SheetEmployee) =>
  salaryToNumber(employee.currentSalary) ||
  salaryToNumber(employee.updatedStipend) ||
  salaryToNumber(employee.oldStipend);

const hasDocument = (value: string) => (value.trim() ? "Available" : "Missing");

const employeeToDocument = (employee: SheetEmployee): BrainDocument => {
  const status = employee.dateOfLeaving ? "Exited" : "Active";
  const salary = bestSalary(employee);
  const slug = employee.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const urls = documentUrlBySerial[employee.serialNo] ?? {
    offerLetterUrl: "",
    panCardUrl: "",
    aadhaarCardUrl: "",
    bankDetailsUrl: ""
  };

  return {
    id: `emp-${slug}`,
    type: "employee",
    title: `${employee.name} - ${status} Employee`,
    status,
    owner: "Founder Office",
    updatedAt: today,
    tags: ["employee", status, "google-sheet-import"],
    fields: {
      serialNo: employee.serialNo,
      name: employee.name,
      phone: employee.phone || "",
      role: "Team Member",
      department: "Engineering",
      monthlySalaryInr: salary,
      currentSalaryRaw: employee.currentSalary || employee.updatedStipend || employee.oldStipend,
      updatedStipendRaw: employee.updatedStipend,
      oldStipendRaw: employee.oldStipend,
      dateOfJoining: employee.dateOfJoining,
      dateOfLeaving: employee.dateOfLeaving,
      status,
      offerLetter: employee.offerLetter,
      panCard: employee.panCard,
      aadhaarCard: employee.aadhaarCard,
      bankDetails: employee.bankDetails,
      bankDetailsDisplay: employee.bankDetails ? "Captured from sheet - protected" : "",
      offerLetterUrl: urls.offerLetterUrl,
      panCardUrl: urls.panCardUrl,
      aadhaarCardUrl: urls.aadhaarCardUrl,
      bankDetailsUrl: urls.bankDetailsUrl,
      offerLetterStatus: hasDocument(employee.offerLetter),
      panCardStatus: hasDocument(employee.panCard),
      aadhaarCardStatus: hasDocument(employee.aadhaarCard),
      bankDetailsStatus: hasDocument(employee.bankDetails),
      paidFebStipend: employee.paidFebStipend,
      paidMarch7: employee.paidMarch7,
      paidFeb3: employee.paidFeb3,
      paidMay7: employee.paidMay7,
      paidJun5: employee.paidJun5
    },
    body: `Imported employee record from the Company Google Sheet.

Name: ${employee.name}
Status: ${status}
Date of joining: ${employee.dateOfJoining || "Not provided"}
Date of leaving: ${employee.dateOfLeaving || "Still active"}
Current salary: ${employee.currentSalary || "Not provided"}
Updated stipend: ${employee.updatedStipend || "Not provided"}
Old stipend: ${employee.oldStipend || "Not provided"}

Document references:
- Offer letter: ${employee.offerLetter || "Missing"}
- PAN card: ${employee.panCard || "Missing"}
- Aadhaar card: ${employee.aadhaarCard || "Missing"}
- Bank details: ${employee.bankDetails ? "Captured from sheet - protected field" : "Missing"}

Payment records:
- Paid Feb stipend: ${employee.paidFebStipend || "Blank"}
- Paid March 7: ${employee.paidMarch7 || "Blank"}
- Paid Feb 3: ${employee.paidFeb3 || "Blank"}
- Paid May 7: ${employee.paidMay7 || "Blank"}
- Paid Jun 5/6: ${employee.paidJun5 || "Blank"}`
  };
};

export const sheetEmployeeDocuments = employees.map(employeeToDocument);
