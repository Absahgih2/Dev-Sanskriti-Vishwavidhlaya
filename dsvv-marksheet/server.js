import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.static('dist'));
app.use(express.static('.'));
app.use(express.static('public'));

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'db.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return { students: [], courses: [], settings: { lastRollNo: null, lastEnrollSuffix: null, lastDmcNo: null } };
  }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let fields = [], insideQuote = false, currentField = '';
    for (const char of line) {
      if (char === '"') insideQuote = !insideQuote;
      else if (char === ',' && !insideQuote) { fields.push(currentField.trim()); currentField = ''; }
      else currentField += char;
    }
    fields.push(currentField.trim());
    const record = {};
    headers.forEach((h, idx) => { record[h] = (fields[idx] || '').replace(/^"|"$/g, '').trim(); });
    records.push(record);
  }
  return records;
}

function getSundayInMonth(year, monthIndex) {
  let date = new Date(year, monthIndex, 1);
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
  date.setDate(date.getDate() + 7);
  return date;
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function calculateIssueDate(session, termType, termName, termIndex, totalTerms) {
  const years = session.match(/\b(20\d{2})\b/g);
  let startYear = new Date().getFullYear(), finalYear = new Date().getFullYear();
  if (years) {
    if (years.length >= 2) { startYear = parseInt(years[0]); finalYear = parseInt(years[years.length - 1]); }
    else if (years.length === 1) { startYear = parseInt(years[0]); finalYear = parseInt(years[0]); }
  }
  let issueYear = finalYear, monthIndex = 7;
  if (termType === 'semester') {
    const semNum = termIndex + 1;
    issueYear = finalYear - Math.floor((totalTerms - semNum) / 2);
    monthIndex = semNum % 2 !== 0 ? 1 : 7;
  } else {
    issueYear = finalYear - (totalTerms - (termIndex + 1));
    monthIndex = 7;
  }
  issueYear = Math.max(startYear, issueYear);
  return formatDate(getSundayInMonth(issueYear, monthIndex));
}

function generateRollNumber(db) {
  if (db.settings.lastRollNo) { db.settings.lastRollNo++; return db.settings.lastRollNo; }
  const r = Math.floor(100000 + Math.random() * 900000);
  db.settings.lastRollNo = r;
  return r;
}

function generateEnrollmentNumber(db, sessionYear) {
  const prefix = sessionYear - 1;
  const suffix = db.settings.lastEnrollSuffix ? db.settings.lastEnrollSuffix + 1 : Math.floor(100000 + Math.random() * 900000);
  db.settings.lastEnrollSuffix = suffix;
  return `${prefix}${suffix}`;
}

function generateDmcNumber(db) {
  if (db.settings.lastDmcNo) { db.settings.lastDmcNo++; return db.settings.lastDmcNo; }
  const d = Math.floor(1000 + Math.random() * 9000);
  db.settings.lastDmcNo = d;
  return d;
}

// Get full database
app.get('/api/db', (_, res) => res.json(readDB()));

// Upload CSV courses
app.post('/api/courses/upload', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const parsed = parseCSV(fs.readFileSync(req.file.path, 'utf8'));
    const coursesMap = {};
    parsed.forEach(row => {
      const name = row['Course'];
      if (!name) return;
      const termName = row['Semester'] || row['Year'] || 'General';
      const termType = row['Semester'] ? 'semester' : (row['Year'] ? 'year' : 'general');
      if (!coursesMap[name]) coursesMap[name] = { name, type: termType, terms: {} };
      if (!coursesMap[name].terms[termName]) coursesMap[name].terms[termName] = [];
      coursesMap[name].terms[termName].push({
        code: row['Course Code'] || '',
        name: row['Subject'] || '',
        maxMarks: parseInt(row['Max Marks']) || 100,
        minMarks: parseInt(row['Min Marks']) || 40
      });
    });
    const db = readDB();
    Object.values(coursesMap).forEach(c => {
      const idx = db.courses.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase());
      if (idx >= 0) db.courses[idx] = c; else db.courses.push(c);
    });
    writeDB(db);
    fs.unlinkSync(req.file.path);
    res.json({ message: 'CSV uploaded successfully', courses: db.courses });
  } catch (err) {
    console.error('CSV upload error:', err);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
});

// Get courses
app.get('/api/courses', (_, res) => res.json(readDB().courses));

// Upload photo
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (req.body.image) {
      const base64 = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const filename = `photo-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
      fs.writeFileSync(path.join(uploadsDir, filename), base64, { encoding: 'base64' });
      return res.json({ photoUrl: `/uploads/${filename}` });
    }
    if (req.file) return res.json({ photoUrl: `/uploads/${req.file.filename}` });
    res.status(400).json({ error: 'No image provided' });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Register student
app.post('/api/students', (req, res) => {
  try {
    const { name, fatherName, motherName, dob, courseName, session, marksheetsData } = req.body;
    if (!name || !fatherName || !motherName || !dob || !courseName || !session) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = readDB();
    const course = db.courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
    if (!course) return res.status(404).json({ error: 'Course not found. Upload CSV first.' });

    const yearMatch = session.match(/\b(20\d{2})\b/g);
    if (!yearMatch) return res.status(400).json({ error: 'Invalid session format' });
    const finalYear = parseInt(yearMatch[yearMatch.length - 1]);

    const rollNo = generateRollNumber(db).toString();
    const enrollmentNo = generateEnrollmentNumber(db, finalYear).toString();

    const terms = Object.keys(course.terms);
    const marksheets = {};
    const publishedDocs = { idCard: false, marksheets: {}, admitCards: {}, results: {} };

    terms.forEach((t, idx) => {
      const dmcNo = generateDmcNumber(db).toString();
      const issueDate = calculateIssueDate(session, course.type, t, idx, terms.length);
      const termMarks = marksheetsData?.[t]?.marks || {};
      marksheets[t] = { dmcNo, issueDate, marks: termMarks, isPublished: false };
      publishedDocs.marksheets[t] = false;
      publishedDocs.admitCards[t] = false;
      publishedDocs.results[t] = false;
    });

    const student = {
      id: Date.now().toString(), name, fatherName, motherName, dob,
      rollNo, enrollmentNo, course: courseName, session,
      photo: req.body.photo || '', marksheets, publishedDocs,
      isPublished: false, createdAt: new Date().toISOString()
    };

    db.students.push(student);
    writeDB(db);
    res.json({ message: 'Student registered successfully', student });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// Edit student
app.put('/api/students/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, motherName, dob, photo, marksheetsData, isCompleteEdit, courseName, session } = req.body;
    const db = readDB();
    const idx = db.students.findIndex(s => s.id === id);
    if (idx < 0) return res.status(404).json({ error: 'Student not found' });

    const student = db.students[idx];
    if (name) student.name = name;
    if (fatherName) student.fatherName = fatherName;
    if (motherName) student.motherName = motherName;
    if (dob) student.dob = dob;
    if (photo !== undefined) student.photo = photo;

    if (isCompleteEdit) {
      if (courseName && courseName !== student.course) {
        const course = db.courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());
        if (!course) return res.status(404).json({ error: 'Course not found' });
        student.course = courseName;
        const sessStr = session || student.session;
        const ym = sessStr.match(/\b(20\d{2})\b/g);
        const fy = ym ? parseInt(ym[ym.length - 1]) : new Date().getFullYear();
        const terms = Object.keys(course.terms);
        const newMs = {}, newPd = { idCard: student.publishedDocs?.idCard || false, marksheets: {}, admitCards: {}, results: {} };
        terms.forEach((t, i) => {
          newMs[t] = { dmcNo: generateDmcNumber(db).toString(), issueDate: calculateIssueDate(sessStr, course.type, t, i, terms.length), marks: {}, isPublished: false };
          newPd.marksheets[t] = false; newPd.admitCards[t] = false; newPd.results[t] = false;
        });
        student.marksheets = newMs;
        student.publishedDocs = newPd;
      }
      if (session && session !== student.session) {
        student.session = session;
        const ym = session.match(/\b(20\d{2})\b/g);
        if (ym) {
          const fy = parseInt(ym[ym.length - 1]);
          student.enrollmentNo = `${fy - 1}${student.enrollmentNo.slice(4)}`;
          const course = db.courses.find(c => c.name.toLowerCase() === student.course.toLowerCase());
          if (course) {
            const terms = Object.keys(course.terms);
            terms.forEach((t, i) => {
              if (student.marksheets[t]) student.marksheets[t].issueDate = calculateIssueDate(session, course.type, t, i, terms.length);
            });
          }
        }
      }
    }

    if (marksheetsData) {
      Object.keys(marksheetsData).forEach(t => {
        if (student.marksheets[t]) {
          if (marksheetsData[t].marks) student.marksheets[t].marks = marksheetsData[t].marks;
          if (marksheetsData[t].dmcNo) student.marksheets[t].dmcNo = marksheetsData[t].dmcNo;
          if (marksheetsData[t].issueDate) student.marksheets[t].issueDate = marksheetsData[t].issueDate;
        }
      });
    }

    db.students[idx] = student;
    writeDB(db);
    res.json({ message: 'Student updated successfully', student });
  } catch (err) {
    console.error('Edit error:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  try {
    const db = readDB();
    const idx = db.students.findIndex(s => s.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Student not found' });
    db.students.splice(idx, 1);
    writeDB(db);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Publish documents
app.post('/api/students/:id/publish', (req, res) => {
  try {
    const { publishedDocs } = req.body;
    if (!publishedDocs) return res.status(400).json({ error: 'Missing publish config' });
    const db = readDB();
    const idx = db.students.findIndex(s => s.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Student not found' });

    let any = publishedDocs.idCard || false;
    ['marksheets', 'admitCards', 'results'].forEach(k => {
      if (publishedDocs[k]) Object.values(publishedDocs[k]).forEach(v => { if (v) any = true; });
    });

    db.students[idx].publishedDocs = publishedDocs;
    db.students[idx].isPublished = any;
    Object.keys(db.students[idx].marksheets).forEach(t => {
      db.students[idx].marksheets[t].isPublished = !!(publishedDocs.marksheets?.[t]);
    });
    writeDB(db);
    res.json({ message: 'Publish settings saved', student: db.students[idx] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish' });
  }
});

// Public portal search
app.get('/api/public/student', (req, res) => {
  try {
    const { name, searchVal } = req.query;
    if (!name || !searchVal) return res.status(400).json({ error: 'Name and Roll/Enrollment required' });
    const db = readDB();
    const student = db.students.find(s =>
      s.isPublished &&
      s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      (s.rollNo.trim() === searchVal.trim() || s.enrollmentNo.trim() === searchVal.trim())
    );
    if (!student) return res.status(404).json({ error: 'No matching published records found.' });
    const course = db.courses.find(c => c.name.toLowerCase() === student.course.toLowerCase());
    res.json({ student, course });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// SPA catch-all — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`DSVV Server running on http://localhost:${PORT}`));
