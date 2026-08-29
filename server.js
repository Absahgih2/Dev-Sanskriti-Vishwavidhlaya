import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve production build from dist folder
app.use(express.static('dist'));
// Serve static assets from root workspace (includes images like Monogram, brand-logo, signature, background)
app.use(express.static('.'));
// Expose public folder
app.use(express.static('public'));

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create data directory if not exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'db.json');

// Helper to read database
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { students: [], courses: [], settings: { lastRollNo: null, lastEnrollSuffix: null, lastDmcNo: null } };
  }
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Multer storage for student photo uploads and CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// CSV Parser Helper
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    let fields = [];
    let insideQuote = false;
    let currentField = '';
    
    for (let char of line) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    
    const record = {};
    headers.forEach((header, index) => {
      let val = fields[index] || '';
      // Clean quotes
      val = val.replace(/^"|"$/g, '').trim();
      record[header] = val;
    });
    records.push(record);
  }
  return records;
}

// Generate a Sunday in a specific month and year
// monthIndex: 0 = Jan, 1 = Feb, 5 = June, 7 = Aug, etc.
function getSundayInMonth(year, monthIndex) {
  // Let's get the 2nd Sunday of the month so it looks like a realistic mid-month issue date
  let date = new Date(year, monthIndex, 1);
  while (date.getDay() !== 0) { // 0 is Sunday
    date.setDate(date.getDate() + 1);
  }
  // Add 7 days to get the second Sunday
  date.setDate(date.getDate() + 7);
  return date;
}

// Format date to DD-MM-YYYY
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Simple auth system - hardcoded users for admin and center portals
const AUTH_USERS = [
  { id: '1', username: 'admin', password: 'dsvv@2024', role: 'admin', name: 'Administrator' },
  { id: '2', username: 'center', password: 'dsvv@2024', role: 'center', name: 'Center Operator' }
];

// Simple token store (in production, use JWT or sessions)
const activeTokens = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }
  req.user = activeTokens.get(token);
  next();
}

// Auth Routes

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, portal } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = AUTH_USERS.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check portal access
    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    const token = generateToken();
    activeTokens.set(token, { id: user.id, username: user.username, role: user.role, name: user.name });
    
    // Clean up old tokens (keep only last 100)
    if (activeTokens.size > 100) {
      const firstKey = activeTokens.keys().next().value;
      activeTokens.delete(firstKey);
    }
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    activeTokens.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// API Routes

// Get complete database (for debug / dashboard state)
app.get('/api/db', (req, res) => {
  res.json(readDB());
});

// Upload and parse course CSV
app.post('/api/courses/upload', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = parseCSV(fileContent);
    
    // Group subjects by Course and then by Semester/Year
    const coursesMap = {};
    
    parsedData.forEach(row => {
      const courseName = row['Course'];
      if (!courseName) return;
      
      const termName = row['Semester'] || row['Year'] || 'General';
      const termType = row['Semester'] ? 'semester' : (row['Year'] ? 'year' : 'general');
      
      if (!coursesMap[courseName]) {
        coursesMap[courseName] = {
          name: courseName,
          type: termType,
          terms: {}
        };
      }
      
      if (!coursesMap[courseName].terms[termName]) {
        coursesMap[courseName].terms[termName] = [];
      }
      
      coursesMap[courseName].terms[termName].push({
        code: row['Course Code'] || '',
        name: row['Subject'] || '',
        maxMarks: parseInt(row['Max Marks']) || 100,
        minMarks: parseInt(row['Min Marks']) || 40
      });
    });
    
    // Save to database
    const db = readDB();
    Object.values(coursesMap).forEach(newCourse => {
      // Check if course already exists, if so overwrite or merge
      const existingIdx = db.courses.findIndex(c => c.name.toLowerCase() === newCourse.name.toLowerCase());
      if (existingIdx >= 0) {
        db.courses[existingIdx] = newCourse;
      } else {
        db.courses.push(newCourse);
      }
    });
    
    writeDB(db);
    
    // Delete temporary uploaded CSV
    fs.unlinkSync(filePath);
    
    res.json({ message: 'CSV uploaded and courses updated successfully', courses: db.courses });
  } catch (err) {
    console.error('Error uploading CSV:', err);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// Get courses list
app.get('/api/courses', (req, res) => {
  const db = readDB();
  res.json(db.courses);
});

// Delete a course by name
app.delete('/api/courses/:name', (req, res) => {
  const db = readDB();
  const courseName = decodeURIComponent(req.params.name);
  const idx = db.courses.findIndex(c => c.name.toLowerCase() === courseName.toLowerCase());
  if (idx === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  db.courses.splice(idx, 1);
  writeDB(db);
  res.json({ success: true, courses: db.courses });
});

// Helper to generate next Roll Number
function generateRollNumber(db) {
  if (db.settings.lastRollNo) {
    const nextRoll = db.settings.lastRollNo + 1;
    db.settings.lastRollNo = nextRoll;
    return nextRoll;
  } else {
    // Generate a random 6 digit number
    const randomRoll = Math.floor(100000 + Math.random() * 900000);
    db.settings.lastRollNo = randomRoll;
    return randomRoll;
  }
}

// Helper to generate next Enrollment Number
// sessionYear: ending year of session e.g. 2025
function generateEnrollmentNumber(db, sessionYear) {
  const prefix = sessionYear - 1; // E.g. session 2025 -> prefix 2024
  let suffix;
  
  if (db.settings.lastEnrollSuffix) {
    suffix = db.settings.lastEnrollSuffix + 1;
  } else {
    // Generate a random 6 digit suffix
    suffix = Math.floor(100000 + Math.random() * 900000);
  }
  
  db.settings.lastEnrollSuffix = suffix;
  return `${prefix}${suffix}`;
}

// Helper to generate next DMC Number
function generateDmcNumber(db) {
  if (db.settings.lastDmcNo) {
    const nextDmc = db.settings.lastDmcNo + 1;
    db.settings.lastDmcNo = nextDmc;
    return nextDmc;
  } else {
    // Generate random 4 digit number
    const randomDmc = Math.floor(1000 + Math.random() * 9000);
    db.settings.lastDmcNo = randomDmc;
    return randomDmc;
  }
}

// Calculate Sunday date of issue
// Calculate Sunday date of issue bounded by the session range
function calculateIssueDate(session, termType, termName, termIndex, totalTerms) {
  const years = session.match(/\b(20\d{2})\b/g);
  let startYear = new Date().getFullYear();
  let finalYear = new Date().getFullYear();
  
  if (years) {
    if (years.length >= 2) {
      startYear = parseInt(years[0]);
      finalYear = parseInt(years[years.length - 1]);
    } else if (years.length === 1) {
      startYear = parseInt(years[0]);
      finalYear = parseInt(years[0]);
    }
  }

  let issueYear = finalYear;
  let monthIndex = 7; // August by default
  
  if (termType === 'semester') {
    // Semester 1, 2, 3, 4, etc.
    const semNum = termIndex + 1; // 1-indexed
    const yearsBack = Math.floor((totalTerms - semNum) / 2);
    issueYear = finalYear - yearsBack;
    
    // If odd semester, it is Feb (index 1). If even, it is August (index 7).
    if (semNum % 2 !== 0) {
      monthIndex = 1; // February
    } else {
      monthIndex = 7; // August
    }
  } else {
    // Year-wise: 1st Year, 2nd Year, etc.
    const yearNum = termIndex + 1;
    const yearsBack = totalTerms - yearNum;
    issueYear = finalYear - yearsBack;
    monthIndex = 7; // August
  }
  
  // Clamp issueYear to startYear so dates don't fall before enrollment
  issueYear = Math.max(startYear, issueYear);
  
  const sunday = getSundayInMonth(issueYear, monthIndex);
  return formatDate(sunday);
}

// Upload cropped photo (raw base64 or file upload)
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (req.body.image) {
      // Base64 upload
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
      const ext = req.body.ext || '.png';
      const filename = `photo-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      
      fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
      return res.json({ photoUrl: `/uploads/${filename}` });
    }
    
    if (req.file) {
      return res.json({ photoUrl: `/uploads/${req.file.filename}` });
    }
    
    res.status(400).json({ error: 'No image data provided' });
  } catch (err) {
    console.error('Error saving uploaded photo:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Register new student (auto-generates numbers and calculates dates)
app.post('/api/students', (req, res) => {
  try {
    const { name, fatherName, motherName, dob, courseName, session, marksheetsData } = req.body;
    
    if (!name || !fatherName || !motherName || !dob || !courseName || !session) {
      return res.status(400).json({ error: 'Missing required student details' });
    }
    
    const db = readDB();
    
    // Find course in db to see its structure
    const course = db.courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
    if (!course) {
      return res.status(404).json({ error: 'Selected course not found in database. Please upload CSV first.' });
    }
    
    // Extract final year of session (e.g. "2025 Final" or "2024-2026" or "2026")
    const yearMatch = session.match(/\b(20\d{2})\b/g);
    if (!yearMatch) {
      return res.status(400).json({ error: 'Invalid session format. Must include a 4-digit year (e.g., 2026 Final)' });
    }
    const finalYear = parseInt(yearMatch[yearMatch.length - 1]); // Take last year matched
    
    // Generate sequential numbers
    const rollNo = generateRollNumber(db).toString();
    const enrollmentNo = generateEnrollmentNumber(db, finalYear).toString();
    
    // Prepare marksheets
    const terms = Object.keys(course.terms); // e.g. ["1st Semester", "2nd Semester"] or ["1st Year", "2nd Year"]
    const totalTerms = terms.length;
    
    const marksheets = {};
    
    terms.forEach((termName, idx) => {
      // Auto generate DMC number
      const dmcNo = generateDmcNumber(db).toString();
      
      // Calculate Date of Issue
      const issueDate = calculateIssueDate(session, course.type, termName, idx, totalTerms);
      
      // Gather marks entered for this term from request or initialize empty
      const termMarks = (marksheetsData && marksheetsData[termName]) ? marksheetsData[termName].marks : {};
      
      marksheets[termName] = {
        dmcNo,
        issueDate,
        marks: termMarks,
        isPublished: false // default false
      };
    });
    
    // Initialize publishedDocs configuration
    const publishedDocs = {
      idCard: false,
      marksheets: {},
      admitCards: {},
      results: {}
    };
    terms.forEach(term => {
      publishedDocs.marksheets[term] = false;
      publishedDocs.admitCards[term] = false;
      publishedDocs.results[term] = false;
    });

    const newStudent = {
      id: Date.now().toString(),
      name,
      fatherName,
      motherName,
      dob,
      rollNo,
      enrollmentNo,
      course: courseName,
      session,
      photo: req.body.photo || '', // URL path of cropped photo
      marksheets,
      publishedDocs,
      isPublished: false, // overall publish status (true if at least one item is published)
      createdAt: new Date().toISOString()
    };
    
    db.students.push(newStudent);
    writeDB(db);
    
    res.json({ message: 'Student registered successfully', student: newStudent });
  } catch (err) {
    console.error('Error registering student:', err);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// Edit student (partial and complete edit support)
app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, motherName, dob, photo, marksheetsData, isCompleteEdit, courseName, session } = req.body;
    
    const db = readDB();
    const studentIdx = db.students.findIndex(s => s.id === id);
    
    if (studentIdx < 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = db.students[studentIdx];
    
    // Apply student base details
    if (name) student.name = name;
    if (fatherName) student.fatherName = fatherName;
    if (motherName) student.motherName = motherName;
    if (dob) student.dob = dob;
    if (photo !== undefined) student.photo = photo;
    
    if (isCompleteEdit) {
      // Changing Course/Session recalculates roll/enrollment number prefixes or structural terms
      if (courseName && courseName !== student.course) {
        const course = db.courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
        if (!course) {
          return res.status(404).json({ error: 'Selected course not found in database.' });
        }
        student.course = courseName;
        
        // Structure change: reset marksheets with new subjects
        const sessionYearStr = session || student.session;
        const yearMatch = sessionYearStr.match(/\b(20\d{2})\b/g);
        const finalYear = yearMatch ? parseInt(yearMatch[yearMatch.length - 1]) : new Date().getFullYear();
        
        const terms = Object.keys(course.terms);
        const totalTerms = terms.length;
        const newMarksheets = {};
        const newPublishedDocs = {
          idCard: student.publishedDocs?.idCard || false,
          marksheets: {},
          admitCards: {},
          results: {}
        };
        
        terms.forEach((termName, idx) => {
          const dmcNo = generateDmcNumber(db).toString();
          const issueDate = calculateIssueDate(sessionYearStr, course.type, termName, idx, totalTerms);
          
          newMarksheets[termName] = {
            dmcNo,
            issueDate,
            marks: {},
            isPublished: false
          };
          newPublishedDocs.marksheets[termName] = false;
          newPublishedDocs.admitCards[termName] = false;
          newPublishedDocs.results[termName] = false;
        });
        student.marksheets = newMarksheets;
        student.publishedDocs = newPublishedDocs;
      }
      
      if (session && session !== student.session) {
        student.session = session;
        
        // Recalculate enrollment prefix
        const yearMatch = session.match(/\b(20\d{2})\b/g);
        if (yearMatch) {
          const finalYear = parseInt(yearMatch[yearMatch.length - 1]);
          const prefix = (finalYear - 1).toString();
          // Update prefix of enrollment
          const currentSuffix = student.enrollmentNo.slice(4);
          student.enrollmentNo = `${prefix}${currentSuffix}`;
          
          // Recalculate issue dates of all marksheets
          const course = db.courses.find(c => c.name.toLowerCase() === student.course.toLowerCase());
          if (course) {
            const terms = Object.keys(course.terms);
            const totalTerms = terms.length;
            terms.forEach((termName, idx) => {
              if (student.marksheets[termName]) {
                student.marksheets[termName].issueDate = calculateIssueDate(session, course.type, termName, idx, totalTerms);
              }
            });
          }
        }
      }
    }
    
    // Update marks and DMC numbers if provided in request
    if (marksheetsData) {
      Object.keys(marksheetsData).forEach(termName => {
        if (student.marksheets[termName]) {
          if (marksheetsData[termName].marks) {
            student.marksheets[termName].marks = marksheetsData[termName].marks;
          }
          if (marksheetsData[termName].dmcNo) {
            student.marksheets[termName].dmcNo = marksheetsData[termName].dmcNo;
          }
          if (marksheetsData[termName].issueDate) {
            student.marksheets[termName].issueDate = marksheetsData[termName].issueDate;
          }
        }
      });
    }
    
    db.students[studentIdx] = student;
    writeDB(db);
    
    res.json({ message: 'Student updated successfully', student });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.students.findIndex(s => s.id === id);
    
    if (index < 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    db.students.splice(index, 1);
    writeDB(db);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Publish student (selective publishing configuration)
app.post('/api/students/:id/publish', (req, res) => {
  try {
    const { id } = req.params;
    const { publishedDocs } = req.body;
    
    if (!publishedDocs) {
      return res.status(400).json({ error: 'Missing published documents configuration' });
    }
    
    const db = readDB();
    const studentIdx = db.students.findIndex(s => s.id === id);
    
    if (studentIdx < 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Determine overall isPublished status (true if at least one checkbox is checked)
    let isAnyPublished = false;
    if (publishedDocs.idCard) isAnyPublished = true;
    
    if (publishedDocs.marksheets) {
      Object.values(publishedDocs.marksheets).forEach(v => { if (v) isAnyPublished = true; });
    }
    if (publishedDocs.admitCards) {
      Object.values(publishedDocs.admitCards).forEach(v => { if (v) isAnyPublished = true; });
    }
    if (publishedDocs.results) {
      Object.values(publishedDocs.results).forEach(v => { if (v) isAnyPublished = true; });
    }
    
    db.students[studentIdx].publishedDocs = publishedDocs;
    db.students[studentIdx].isPublished = isAnyPublished;
    
    // Legacy support: sync terms back to marksheets.isPublished
    Object.keys(db.students[studentIdx].marksheets).forEach(termName => {
      const isSemPublished = publishedDocs.marksheets && publishedDocs.marksheets[termName];
      db.students[studentIdx].marksheets[termName].isPublished = !!isSemPublished;
    });
    
    writeDB(db);
    res.json({ message: 'Selective publishing settings saved successfully', student: db.students[studentIdx] });
  } catch (err) {
    console.error('Error publishing student:', err);
    res.status(500).json({ error: 'Failed to publish student' });
  }
});

// Search API for public website (lookup student)
// Checks published students matching name AND (roll number OR enrollment number)
app.get('/api/public/student', (req, res) => {
  try {
    const { name, searchVal } = req.query; // searchVal can be rollNo or enrollmentNo
    
    if (!name || !searchVal) {
      return res.status(400).json({ error: 'Name and Roll/Enrollment number are required' });
    }
    
    const db = readDB();
    
    // Find matching published student
    const student = db.students.find(s => 
      s.isPublished && 
      s.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      (s.rollNo.trim() === searchVal.trim() || s.enrollmentNo.trim() === searchVal.trim())
    );
    
    if (!student) {
      return res.status(404).json({ error: 'No matching student records found. Make sure the administrator has published your documents.' });
    }
    
    // Look up the full course info to return subject details (max marks, min marks, code, name)
    const course = db.courses.find(c => c.name.toLowerCase() === student.course.toLowerCase());
    
    res.json({ student, course });
  } catch (err) {
    console.error('Error searching public student database:', err);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
