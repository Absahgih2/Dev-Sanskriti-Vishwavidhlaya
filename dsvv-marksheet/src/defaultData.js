export const DEFAULT_COURSES = [
  {
    name: "BACHELOR OF SCIENCE (B.SC.)",
    type: "semester",
    terms: {
      "1st Semester": [
        { code: "BSC 101", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 102", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 103", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 104", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ],
      "2nd Semester": [
        { code: "BSC 201", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 202", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 203", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 204", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ],
      "3rd Semester": [
        { code: "BSC 301", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 302", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 303", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 304", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ],
      "4th Semester": [
        { code: "BSC 401", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 402", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 403", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 404", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ],
      "5th Semester": [
        { code: "BSC 501", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 502", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 503", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 504", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ],
      "6th Semester": [
        { code: "BSC 601", name: "YOGA", maxMarks: 100, minMarks: 40 },
        { code: "BSC 602", name: "PHYSICS", maxMarks: 100, minMarks: 40 },
        { code: "BSC 603", name: "CHEMISTRY", maxMarks: 100, minMarks: 40 },
        { code: "BSC 604", name: "MATHEMATICS", maxMarks: 100, minMarks: 40 }
      ]
    }
  },
  {
    name: "BACHELOR OF BUSINESS ADMINISTRATION",
    type: "semester",
    terms: {
      "1st Semester": [
        { code: "BBA 101", name: "MICROECONOMICS", maxMarks: 100, minMarks: 40 },
        { code: "BBA 102", name: "QUANTITATIVE TECHNIQUES - I", maxMarks: 100, minMarks: 40 },
        { code: "BBA 103", name: "FINANCIAL ACCOUNTING", maxMarks: 100, minMarks: 40 },
        { code: "BBA 104", name: "PRINCIPLES OF MANAGEMENT", maxMarks: 100, minMarks: 40 },
        { code: "BBA 105", name: "INDIA SOCIO-POLITICAL ECONOMICS", maxMarks: 100, minMarks: 40 },
        { code: "BBA 106", name: "ESSENTIALS OF IT", maxMarks: 100, minMarks: 40 }
      ]
    }
  },
  {
    name: "BACHELOR OF ARTS (B.A.)",
    type: "year",
    terms: {
      "1st Year": [
        { code: "BA 101", name: "GENERAL", maxMarks: 100, minMarks: 40 },
        { code: "BA 102", name: "ENGLISH", maxMarks: 100, minMarks: 40 },
        { code: "BA 103", name: "HINDI", maxMarks: 100, minMarks: 40 },
        { code: "BA 104", name: "SANSKRIT", maxMarks: 100, minMarks: 40 }
      ],
      "2nd Year": [
        { code: "BA 201", name: "GENERAL", maxMarks: 100, minMarks: 40 },
        { code: "BA 202", name: "ENGLISH", maxMarks: 100, minMarks: 40 },
        { code: "BA 203", name: "HINDI", maxMarks: 100, minMarks: 40 },
        { code: "BA 204", name: "SANSKRIT", maxMarks: 100, minMarks: 40 }
      ],
      "3rd Year": [
        { code: "BA 301", name: "GENERAL", maxMarks: 100, minMarks: 40 },
        { code: "BA 302", name: "ENGLISH", maxMarks: 100, minMarks: 40 },
        { code: "BA 303", name: "HINDI", maxMarks: 100, minMarks: 40 },
        { code: "BA 304", name: "SANSKRIT", maxMarks: 100, minMarks: 40 }
      ]
    }
  }
];

export const DEFAULT_STUDENTS = [
  {
    id: "std-sample-1",
    name: "AASHISH BAGH",
    fatherName: "RAJESH BAGH",
    motherName: "SUNITA BAGH",
    dob: "15/05/2002",
    course: "BACHELOR OF SCIENCE (B.SC.)",
    session: "2024-2026",
    email: "aashish.bagh@example.com",
    rollNo: 231456,
    enrollmentNo: "2023231456",
    photo: "student_photo.jpg",
    isPublished: true,
    centerCode: "DSVV-CTR-01",
    marksheets: {
      "1st Semester": {
        dmcNo: 8492,
        issueDate: "28-02-2024",
        marks: { "BSC 101": 78, "BSC 102": 82, "BSC 103": 75, "BSC 104": 88 }
      },
      "2nd Semester": {
        dmcNo: 8493,
        issueDate: "25-08-2024",
        marks: { "BSC 201": 80, "BSC 202": 85, "BSC 203": 79, "BSC 204": 90 }
      },
      "3rd Semester": {
        dmcNo: 8494,
        issueDate: "23-02-2025",
        marks: { "BSC 301": 84, "BSC 302": 81, "BSC 303": 86, "BSC 304": 92 }
      },
      "4th Semester": {
        dmcNo: 8495,
        issueDate: "24-08-2025",
        marks: { "BSC 401": 86, "BSC 402": 88, "BSC 403": 82, "BSC 404": 94 }
      },
      "5th Semester": {
        dmcNo: 8496,
        issueDate: "22-02-2026",
        marks: { "BSC 501": 88, "BSC 502": 90, "BSC 503": 85, "BSC 504": 95 }
      },
      "6th Semester": {
        dmcNo: 8497,
        issueDate: "23-08-2026",
        marks: { "BSC 601": 90, "BSC 602": 92, "BSC 603": 89, "BSC 604": 96 }
      }
    },
    publishedDocs: {
      marksheets: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      },
      admitCards: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      },
      results: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      }
    }
  },
  {
    id: "std-sample-2",
    name: "RAMESH BAGH",
    fatherName: "RAJESH BAGH",
    motherName: "SUNITA BAGH",
    dob: "12/08/2003",
    course: "BACHELOR OF SCIENCE (B.SC.)",
    session: "2024-2026",
    email: "ramesh.bagh@example.com",
    rollNo: 232151,
    enrollmentNo: "2023232151",
    photo: "student_photo.jpg",
    isPublished: true,
    centerCode: "DSVV-CTR-01",
    marksheets: {
      "1st Semester": {
        dmcNo: 8510,
        issueDate: "28-02-2024",
        marks: { "BSC 101": 75, "BSC 102": 80, "BSC 103": 72, "BSC 104": 85 }
      },
      "2nd Semester": {
        dmcNo: 8511,
        issueDate: "25-08-2024",
        marks: { "BSC 201": 78, "BSC 202": 82, "BSC 203": 76, "BSC 204": 88 }
      },
      "3rd Semester": {
        dmcNo: 8512,
        issueDate: "23-02-2025",
        marks: { "BSC 301": 82, "BSC 302": 85, "BSC 303": 80, "BSC 304": 90 }
      },
      "4th Semester": {
        dmcNo: 8513,
        issueDate: "24-08-2025",
        marks: { "BSC 401": 84, "BSC 402": 86, "BSC 403": 81, "BSC 404": 91 }
      },
      "5th Semester": {
        dmcNo: 8514,
        issueDate: "22-02-2026",
        marks: { "BSC 501": 86, "BSC 502": 88, "BSC 503": 84, "BSC 504": 93 }
      },
      "6th Semester": {
        dmcNo: 8515,
        issueDate: "23-08-2026",
        marks: { "BSC 601": 88, "BSC 602": 90, "BSC 603": 87, "BSC 604": 95 }
      }
    },
    publishedDocs: {
      marksheets: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      },
      admitCards: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      },
      results: {
        "1st Semester": true, "2nd Semester": true, "3rd Semester": true,
        "4th Semester": true, "5th Semester": true, "6th Semester": true
      }
    }
  }
];

export const DEFAULT_CENTERS = [
  {
    id: "ctr-1",
    centerCode: "DSVV-CTR-01",
    centerName: "DSVV RAIPUR REGIONAL CENTER",
    coordinatorName: "DR. SURESH SHARMA",
    email: "center.raipur@devsanskritivishwavidyalaya.com",
    phone: "+91-9876543210",
    password: "center@2026",
    status: "approved",
    walletBalance: 15000,
    createdAt: "2026-08-20",
    transactions: [
      { id: "tx-1", date: "2026-08-20 10:30", type: "credit", amount: 15000, description: "Initial Admin Wallet Recharge", balanceAfter: 15000 }
    ]
  }
];

export function parseCSVClient(text) {
  const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = {};
    let cur = '', inQuotes = false, col = 0;
    for (let c = 0; c < lines[i].length; c++) {
      const char = lines[i][c];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        row[headers[col] || `col_${col}`] = cur.trim();
        cur = ''; col++;
      } else cur += char;
    }
    row[headers[col] || `col_${col}`] = cur.trim();
    rows.push(row);
  }
  return rows;
}
