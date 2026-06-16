import type { BrainDocument } from "./types";

const today = "2026-06-17";

type SheetEmployee = {
  serialNo: number;
  name: string;
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
    name: "Saumil Bisht",
    dateOfLeaving: "11/1/2026",
    currentSalary: "",
    updatedStipend: "-",
    dateOfJoining: "13/10/2025",
    oldStipend: "10k",
    offerLetter: "Saumil - EnxtAI Internship Offer letter.pdf",
    panCard: "Saumil Pan.pdf",
    aadhaarCard: "Saumil Aadhar.pdf",
    bankDetails: "Saumil Cheque",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 2,
    name: "Subhanshu Thapa",
    dateOfLeaving: "27/03/2026",
    currentSalary: "",
    updatedStipend: "-",
    dateOfJoining: "28/10/2025",
    oldStipend: "15k",
    offerLetter: "Subhanshu - EnxtAI Internship Offer letter.pdf",
    panCard: "Subhanshu Pan",
    aadhaarCard: "Subhanshu Aadhar",
    bankDetails: "Subhanshu Cheque",
    paidFebStipend: "Yes",
    paidMarch7: "12500",
    paidFeb3: "16500",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 3,
    name: "Saurabh Kumar",
    dateOfLeaving: "",
    currentSalary: "25K",
    updatedStipend: "25K",
    dateOfJoining: "27/10/2025",
    oldStipend: "15K",
    offerLetter: "Saurabh- EnxtAI Internship Offer letter",
    panCard: "Saurabh Aadhar & Pan.HEIC",
    aadhaarCard: "Saurabh Aadhar & Pan.HEIC",
    bankDetails: "Saurabh Cheque.HEIC",
    paidFebStipend: "Yes",
    paidMarch7: "15000",
    paidFeb3: "11500",
    paidMay7: "25000",
    paidJun5: "25000"
  },
  {
    serialNo: 4,
    name: "Sarabjeet Srivastava",
    dateOfLeaving: "10/04/2026",
    currentSalary: "",
    updatedStipend: "15K",
    dateOfJoining: "27/10/2025",
    oldStipend: "15K",
    offerLetter: "Sarabjeet - EnxtAI Internship Offer letter",
    panCard: "Sarabjeet Pan.jpeg",
    aadhaarCard: "Sarabjeet Aadhar.jpeg",
    bankDetails: "Sarabjeet Cheque.jpeg",
    paidFebStipend: "Yes",
    paidMarch7: "15000",
    paidFeb3: "11500",
    paidMay7: "7250",
    paidJun5: ""
  },
  {
    serialNo: 5,
    name: "Feroz Khan",
    dateOfLeaving: "09/04/2026",
    currentSalary: "-",
    updatedStipend: "-",
    dateOfJoining: "17/11/2025",
    oldStipend: "10k",
    offerLetter: "Feroz -EnxtAI Internship Offer letter.docx",
    panCard: "Feroz Pan.jpeg",
    aadhaarCard: "Feroz Aadhar.pngg",
    bankDetails: "Feroz UPi.jpeg  A/c No.: 7648522932 IFSC Code: KKBK0004618 Home Branch: DELHI-JASOLA VIHAR UPI ID: 7838188349@kotak811",
    paidFebStipend: "Yes",
    paidMarch7: "10000",
    paidFeb3: "4500",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 6,
    name: "Manya Raghav",
    dateOfLeaving: "24/04/2026",
    currentSalary: "",
    updatedStipend: "18K",
    dateOfJoining: "24/11/2025",
    oldStipend: "15k",
    offerLetter: "Manya Countersigned Offer letter.pdf",
    panCard: "Manya Pan.jpeg",
    aadhaarCard: "Manya Aadhar Card.pdf",
    bankDetails: "Manya Cheque.jpg",
    paidFebStipend: "Yes - 12500",
    paidMarch7: "15000",
    paidFeb3: "3000",
    paidMay7: "13000",
    paidJun5: ""
  },
  {
    serialNo: 7,
    name: "Roopraj",
    dateOfLeaving: "13/02/2026",
    currentSalary: "-",
    updatedStipend: "-",
    dateOfJoining: "11/12/2025",
    oldStipend: "10k",
    offerLetter: "Roopraj Offer Letter.pdf",
    panCard: "Roopraj PAN.jpeg",
    aadhaarCard: "Roopraj Aadhar.pdf",
    bankDetails: "Roopraj Cheque .pdf",
    paidFebStipend: "Yes",
    paidMarch7: "",
    paidFeb3: "6500",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 8,
    name: "Guneeka Sharma",
    dateOfLeaving: "30/04/2026",
    currentSalary: "",
    updatedStipend: "15K",
    dateOfJoining: "11/12/2025",
    oldStipend: "10k",
    offerLetter: "Guneeka Offer Letter.pdf",
    panCard: "Guneeka PAN.jpeg",
    aadhaarCard: "Guneeka Aadhar.pdf",
    bankDetails: "Guneeka Cheque.jpeg",
    paidFebStipend: "Yes - 9500",
    paidMarch7: "10000",
    paidFeb3: "6500",
    paidMay7: "13000",
    paidJun5: ""
  },
  {
    serialNo: 9,
    name: "Paritoshi",
    dateOfLeaving: "",
    currentSalary: "25K",
    updatedStipend: "15K",
    dateOfJoining: "11/12/2025",
    oldStipend: "10k",
    offerLetter: "Paritoshi Offer Letter.pdf",
    panCard: "Paritoshi Pan & Aadhar.jpeg",
    aadhaarCard: "Paritoshi Pan & Aadhar.jpeg",
    bankDetails: "Name : Paritoshi Suryavanshi Acc no. : 41153034224Ifsc : SBIN0013238",
    paidFebStipend: "Yes",
    paidMarch7: "10000",
    paidFeb3: "6500",
    paidMay7: "18000",
    paidJun5: "15000"
  },
  {
    serialNo: 10,
    name: "Dhruv",
    dateOfLeaving: "",
    currentSalary: "25K",
    updatedStipend: "25K",
    dateOfJoining: "11/12/2025",
    oldStipend: "15k",
    offerLetter: "Dhruv Offer letter.pdf",
    panCard: "Dhruv Pan.pdf",
    aadhaarCard: "Dhruv Aadhar.pdf",
    bankDetails: "A/c No.: 7445365909 IFSC Code: KKBK0005028 Home Branch: GREATER NOIDA",
    paidFebStipend: "Yes",
    paidMarch7: "15000",
    paidFeb3: "10000",
    paidMay7: "25000",
    paidJun5: "25000"
  },
  {
    serialNo: 11,
    name: "Anshukiran",
    dateOfLeaving: "",
    currentSalary: "25K",
    updatedStipend: "18K",
    dateOfJoining: "10/1/2026",
    oldStipend: "12k",
    offerLetter: "Anshukiran Offer letter Signed.pdf",
    panCard: "Anshukiran PAN .jpeg",
    aadhaarCard: "Anshukiran Aadhar.jpeg",
    bankDetails: "Account number : 031510162500 IFSC : IPOS0000001 NAME : ANSHUKIRAN SHARMA BANK NAME : INDIA POST PAYMENTS BANK",
    paidFebStipend: "Yes",
    paidMarch7: "12000",
    paidFeb3: "8000",
    paidMay7: "18000",
    paidJun5: "25000"
  },
  {
    serialNo: 12,
    name: "Shashank",
    dateOfLeaving: "",
    currentSalary: "30k",
    updatedStipend: "",
    dateOfJoining: "6/5/2026",
    oldStipend: "",
    offerLetter: "",
    panCard: "Shashank pancard (1).jpg",
    aadhaarCard: "Shashank Aadhar.png",
    bankDetails: "Account no:- 714318210000612 IFSC code:- BKID0007143 Name :- Shashank Keshari Branch:- Raj Nagar Extension, Ghaziabad Bank Name : Bank of India",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "( Paid extra)",
    paidJun5: "30000"
  },
  {
    serialNo: 13,
    name: "Mayank",
    dateOfLeaving: "",
    currentSalary: "10K",
    updatedStipend: "",
    dateOfJoining: "11/5/2026",
    oldStipend: "",
    offerLetter: "",
    panCard: "Mayank Pan.jpeg",
    aadhaarCard: "Mayank Aadhar.jpeg",
    bankDetails: "Account no. 0942100100000018 IFC code PUNB0094210 Bank name Punjab National Bank",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: "6667"
  },
  {
    serialNo: 14,
    name: "Poras",
    dateOfLeaving: "",
    currentSalary: "10K",
    updatedStipend: "",
    dateOfJoining: "12/5/2026",
    oldStipend: "",
    offerLetter: "",
    panCard: "Porus PAN.pdf",
    aadhaarCard: "Porus Aadhaar Card.pdf",
    bankDetails: "15131000003318 PSIB0021513 Punbaj and sindh bank",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: "5000"
  },
  {
    serialNo: 15,
    name: "Alok",
    dateOfLeaving: "",
    currentSalary: "5K",
    updatedStipend: "",
    dateOfJoining: "18/5/2026",
    oldStipend: "",
    offerLetter: "",
    panCard: "Alok Pan.jpeg",
    aadhaarCard: "Alok Aadhar.jpeg",
    bankDetails: "Alok Bank.jpeg",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: ""
  },
  {
    serialNo: 16,
    name: "Simran",
    dateOfLeaving: "",
    currentSalary: "5K",
    updatedStipend: "",
    dateOfJoining: "18/5/2026",
    oldStipend: "",
    offerLetter: "",
    panCard: "Simran Pan.jpeg",
    aadhaarCard: "Simran Aadhar.pdf",
    bankDetails: "Ac No. - 908410510001619 IFSC - BKID0009084",
    paidFebStipend: "",
    paidMarch7: "",
    paidFeb3: "",
    paidMay7: "",
    paidJun5: ""
  }
];

const documentUrlBySerial: Record<
  number,
  {
    offerLetterUrl: string;
    panCardUrl: string;
    aadhaarCardUrl: string;
    bankDetailsUrl: string;
  }
> = {
  1: {
    offerLetterUrl: "https://drive.google.com/file/d/1cATgCrZBKaovCfpQSB_6-t5MN6oa4yqY/view?usp=drivesdk",
    panCardUrl: "https://drive.google.com/file/d/1YUdDQZEBTSlh_vYMcLRScw2_NINB-Rae/view?usp=drivesdk",
    aadhaarCardUrl: "https://drive.google.com/file/d/19ayBWgfFjLUGStuR8rkIOCwYpt92xU9-/view?usp=drivesdk",
    bankDetailsUrl: "https://drive.google.com/file/d/1vV7_sd9IXWBD-y1kTUTMyg-0Bj9vd_fu/view?usp=drivesdk"
  },
  2: {
    offerLetterUrl: "https://drive.google.com/file/d/1o527pJJ3_8RW3tSjGplGdAMwdq7011G9/view?usp=drivesdk",
    panCardUrl: "https://drive.google.com/file/d/1CFJ5LX-nwNqLy7brZm4Mm6I6wHrWxoi9/view?usp=drivesdk",
    aadhaarCardUrl: "https://drive.google.com/file/d/1QWMuDfsfLozCmRyV67BEoBYICj9rUgi0/view?usp=drivesdk",
    bankDetailsUrl: "https://drive.google.com/file/d/115qYqQqCXVCK5_VpgxUvfbMAO6BALE3S/view?usp=drivesdk"
  },
  3: {
    offerLetterUrl: "https://drive.google.com/file/d/1CkM9eiH5rk5NbuWdSTo_6OiXGFb9n05j/view?usp=drivesdk",
    panCardUrl: "https://drive.google.com/file/d/1dB1cY6DCdgk1J0Qa_qdWIPIRLYw0ZDJo/view?usp=sharing",
    aadhaarCardUrl: "https://drive.google.com/file/d/1dB1cY6DCdgk1J0Qa_qdWIPIRLYw0ZDJo/view?usp=sharing",
    bankDetailsUrl: "https://drive.google.com/file/d/1ANY6dpQ5-A1EkTaeCelv70dqjdV59Dr4/view?usp=drive_link"
  },
  4: {
    offerLetterUrl: "https://drive.google.com/file/d/1mv9yrmtL_3kyJ3LaczMorY0SFlG5vnG0/view?usp=drivesdk",
    panCardUrl: "https://drive.google.com/file/d/1r6l7GpPaZEEW-ky3x-cviaNlQ6CsHnC8/view?usp=sharing",
    aadhaarCardUrl: "https://drive.google.com/file/d/1h82p2lv1zexnqb33OcSAUzWH0gHm_M6d/view?usp=drive_link",
    bankDetailsUrl: "https://drive.google.com/file/d/1u4Uji4m9tc8fOP--UONbgXVDokQKfCbn/view?usp=drive_link"
  },
  5: {
    offerLetterUrl: "https://docs.google.com/document/d/19AA_OJJLY_rP9ouTb_iwjQvfDHwhQ4jZ/edit?usp=drive_link&ouid=102715197375878789261&rtpof=true&sd=true",
    panCardUrl: "https://drive.google.com/file/d/1aBUkgHSgeQK77AYOwkSHL7NM3IEa6Ox1/view?usp=sharing",
    aadhaarCardUrl: "https://drive.google.com/file/d/1yDO6ILn0A38po_NJuz34SjH3QVOGfu5N/view?usp=sharing",
    bankDetailsUrl: "https://drive.google.com/file/d/16VMLdxQAew22tn3Vi2qLi875bgLpYbPU/view?usp=sharing"
  },
  6: {
    offerLetterUrl: "https://drive.google.com/file/d/1Qkf38w1RzwUJQLnc_NzX6v5617M8Qz2t/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/1lp0wUeCu6dPfZDY2WrMzyZ6wA-JubB3N/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1PkBqZR6ordHwXQpJ_MAuHwiQLtyOYwUl/view?usp=sharing",
    bankDetailsUrl: "https://drive.google.com/file/d/1hqT5Yf3HAY30rSJiU1TkrTCNCYrFgLnF/view?usp=drive_link"
  },
  7: {
    offerLetterUrl: "https://drive.google.com/file/d/1bvDwWbW7RWmX3oQ5RPL3fAoNL8yhYHJU/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/1XTp53jNWdxsy3tiygnzT_uNA4KIU6fut/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1n5OaEuT8U7FrqM1Q5NSwcveX871XkEIP/view?usp=drive_link",
    bankDetailsUrl: "https://drive.google.com/file/d/1b3ksiEh5W9cRKi3qj6jNs34GVSnsQN9_/view?usp=drive_link"
  },
  8: {
    offerLetterUrl: "https://drive.google.com/file/d/14BKwpbkLd1dniUxkxDctgP0P-kN23klN/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/10ouIinBQVDKrVXLTz9Dz0K4i8GFudZbX/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/13nkuS3GObUffLXtt4NCZc05xSAA0yaef/view?usp=drive_link",
    bankDetailsUrl: "https://drive.google.com/file/d/1kkb7cgLlmDCI05Apb9qvzYFL5Xp03Dr3/view?usp=drive_link"
  },
  9: {
    offerLetterUrl: "https://drive.google.com/file/d/1sYyjd3nSph6X1eZtFKgM8ECOf8SjYIT8/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/1QYnhsM5x__8yYHLjtTC8GOn3jUe1oXfr/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1QYnhsM5x__8yYHLjtTC8GOn3jUe1oXfr/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  10: {
    offerLetterUrl: "https://drive.google.com/file/d/139KA0zBYKVVXmlr56jIGlLW8xxi7cYAS/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/1OgMKJ4qJdf4ZwX9eU6CzsT_hERFnhG2w/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1f28vx5D_fxx2tmVkt5EV-g0YnztaH4IJ/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  11: {
    offerLetterUrl: "https://drive.google.com/file/d/13BYM3VMB2Ud-cnbsa0ZkYPkeihHS6C5F/view?usp=drive_link",
    panCardUrl: "https://drive.google.com/file/d/1r9vw-xXHJ6sUZSSmjoDV5lbYHc2uKFmL/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1e0QkhjBjuwVOoMqn-PR0AnzkPotdGggn/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  12: {
    offerLetterUrl: "",
    panCardUrl: "https://drive.google.com/file/d/1cg7Ni0lWsv8yEvf36M0k3PWxJBgWwnPC/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1dVA45igRdiY6-KWtZtldsJZTmGFCB1wf/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  13: {
    offerLetterUrl: "",
    panCardUrl: "https://drive.google.com/file/d/1t1j4Pn786qBs4b3YXdulxhVgeDZfTDXO/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1X2nB8AcNlnTiWZf0TvVT0XhT2NV33Vgu/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  14: {
    offerLetterUrl: "",
    panCardUrl: "https://drive.google.com/file/d/1kGLXyOMSrxrI8YE2gUJGfx8TpWxtEEBI/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1RCXFraJtXTxrV3behaUM_daBMym_kzhx/view?usp=drive_link",
    bankDetailsUrl: ""
  },
  15: {
    offerLetterUrl: "",
    panCardUrl: "https://drive.google.com/file/d/1rx0DkU19rzXqiKhBYDnkTJn81a1vrY-y/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/191cBFOHqeWTw5Xf6h1Fs7RnlHWzjEvUJ/view?usp=drive_link",
    bankDetailsUrl: "https://drive.google.com/file/d/1z_mOFCMbXFLr6UD7X0-dvmqYtL06_MZ-/view?usp=drive_link"
  },
  16: {
    offerLetterUrl: "",
    panCardUrl: "https://drive.google.com/file/d/1aNTdOQDOd9KxjzALd3AWsUIKQsc9cM__/view?usp=drive_link",
    aadhaarCardUrl: "https://drive.google.com/file/d/1kp8CoTQpGo8DXag_Q7nTfGhLJb5kmS1h/view?usp=drive_link",
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
      role: "Team Member",
      department: "Inext AI",
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
    body: `Imported employee record from the Inext AI Google Sheet.

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
