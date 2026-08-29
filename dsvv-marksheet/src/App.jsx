import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, UploadCloud, FileText, Calendar,
  Edit3, Trash2, Globe, Sliders, CheckCircle, Eye,
  Printer, ArrowLeft, User, Image, BookOpen,
  RefreshCw, X, AlertCircle, Building2, Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MarksheetTemplate from './components/MarksheetTemplate';
import AdmitCardTemplate from './components/AdmitCardTemplate';
import OnlineResultTemplate from './components/OnlineResultTemplate';
import ImageCropper from './components/ImageCropper';
import { DEFAULT_COURSES, DEFAULT_STUDENTS, parseCSVClient } from './defaultData';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return v === 'admin' || v === 'center' || v === 'portal' ? v : 'portal';
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('dsvv_courses');
    return saved ? JSON.parse(saved) : DEFAULT_COURSES;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('dsvv_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSession, setSearchSession] = useState('');
  const [formData, setFormData] = useState({ name: '', fatherName: '', motherName: '', dob: '', courseName: '', session: '', photo: '' });
  const [selectedTerm, setSelectedTerm] = useState('');
  const [formMarksheets, setFormMarksheets] = useState({});
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isCompleteEdit, setIsCompleteEdit] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState('');
  const [activeDocStudent, setActiveDocStudent] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('marksheet');
  const [activeDocTerm, setActiveDocTerm] = useState('');
  
  // Center Portal State
  const [centerSearch, setCenterSearch] = useState('');
  const [centerCourseFilter, setCenterCourseFilter] = useState('');
  const [centerSessionFilter, setCenterSessionFilter] = useState('');

  // Portal State
  const [portalName, setPortalName] = useState('');
  const [portalSearchVal, setPortalSearchVal] = useState('');
  const [portalStudent, setPortalStudent] = useState(null);
  const [portalCourse, setPortalCourse] = useState(null);
  const [portalError, setPortalError] = useState('');
  const [portalActiveTab, setPortalActiveTab] = useState('marksheet');
  const [portalActiveTerm, setPortalActiveTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('dsvv_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('dsvv_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        if (data.courses && data.courses.length > 0) setCourses(data.courses);
        if (data.students && data.students.length > 0) setStudents(data.students);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  const getTermNames = (course) => course ? Object.keys(course.terms || {}) : [];
  const getTermSubjects = (course, term) => (course && course.terms && course.terms[term]) || [];

  const resetForm = () => {
    setFormData({ name: '', fatherName: '', motherName: '', dob: '', courseName: '', session: '', photo: '' });
    setFormMarksheets({});
    setEditingStudentId(null);
    setIsCompleteEdit(false);
    setSelectedTerm('');
    setCropSrc(null);
  };

  const startEdit = (student, complete) => {
    setEditingStudentId(student.id);
    setIsCompleteEdit(complete);
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      motherName: student.motherName,
      dob: student.dob,
      courseName: student.course,
      session: student.session,
      photo: student.photo
    });
    const terms = Object.keys(student.marksheets || {});
    const initialMarks = {};
    terms.forEach(t => { initialMarks[t] = student.marksheets[t]?.marks || {}; });
    setFormMarksheets(initialMarks);
    setSelectedTerm(terms[0] || '');
    setAdminTab('add-student');
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob || !formData.courseName || !formData.session) {
      alert('Please fill all required fields.');
      return;
    }

    const course = courses.find(c => c.name === formData.courseName);
    const terms = getTermNames(course);
    const marksheetsData = {};
    
    terms.forEach((t, i) => {
      const existing = editingStudentId ? students.find(s => s.id === editingStudentId)?.marksheets?.[t] : null;
      marksheetsData[t] = {
        dmcNo: existing?.dmcNo || Math.floor(1000 + Math.random() * 9000),
        issueDate: existing?.issueDate || '28-02-2026',
        marks: formMarksheets[t] || {}
      };
    });

    const publishedDocs = {
      marksheets: {},
      admitCards: {},
      results: {}
    };
    terms.forEach(t => {
      publishedDocs.marksheets[t] = true;
      publishedDocs.admitCards[t] = true;
      publishedDocs.results[t] = true;
    });

    let newStudent;
    if (editingStudentId) {
      const existing = students.find(s => s.id === editingStudentId);
      newStudent = {
        ...existing,
        ...formData,
        course: formData.courseName,
        marksheets: marksheetsData,
        publishedDocs: existing?.publishedDocs || publishedDocs
      };
      setStudents(prev => prev.map(s => s.id === editingStudentId ? newStudent : s));
    } else {
      const lastRoll = students.reduce((max, s) => Math.max(max, parseInt(s.rollNo) || 230000), 231450);
      const newRoll = lastRoll + 1;
      const sessionYear = parseInt(formData.session.match(/\b(20\d{2})\b/)?.[0] || '2023');
      newStudent = {
        id: 'std-' + Date.now(),
        name: formData.name,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        course: formData.courseName,
        session: formData.session,
        photo: formData.photo,
        rollNo: newRoll,
        enrollmentNo: `${sessionYear - 1}${newRoll}`,
        isPublished: true,
        marksheets: marksheetsData,
        publishedDocs
      };
      setStudents(prev => [newStudent, ...prev]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
    }

    try {
      const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students';
      const method = editingStudentId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, marksheetsData, isCompleteEdit })
      });
    } catch (_) {}

    setAdminTab('dashboard');
    resetForm();
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student record?')) return;
    setStudents(prev => prev.filter(s => s.id !== id));
    try { await fetch(`/api/students/${id}`, { method: 'DELETE' }); } catch (_) {}
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) { setCsvMessage('Please select a CSV file first.'); return; }
    setCsvMessage('Processing CSV...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const rows = parseCSVClient(text);
        const coursesMap = {};
        
        rows.forEach(row => {
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

        const newCourses = Object.values(coursesMap);
        if (newCourses.length > 0) {
          setCourses(prev => {
            const updated = [...prev];
            newCourses.forEach(nc => {
              const idx = updated.findIndex(c => c.name === nc.name);
              if (idx >= 0) updated[idx] = nc;
              else updated.push(nc);
            });
            return updated;
          });
          setCsvMessage(`Successfully imported ${newCourses.length} course(s)!`);
          setCsvFile(null);
        } else {
          setCsvMessage('Could not parse any courses from CSV.');
        }
      } catch (err) {
        setCsvMessage('Error parsing CSV file: ' + err.message);
      }
    };
    reader.readAsText(csvFile);
  };

  const handleMarkChange = (subCode, val, maxMarks) => {
    const num = val === '' ? '' : Math.min(maxMarks, Math.max(0, parseInt(val) || 0));
    setFormMarksheets(prev => ({
      ...prev,
      [selectedTerm]: { ...(prev[selectedTerm] || {}), [subCode]: num }
    }));
  };

  const generateMarks = () => {
    const course = courses.find(c => c.name === formData.courseName);
    if (!course || !selectedTerm) return;
    const subjects = getTermSubjects(course, selectedTerm);
    const pct = parseInt(prompt('Enter target percentage (35-100):', '75'));
    if (isNaN(pct) || pct < 35 || pct > 100) return;
    const totalMax = subjects.reduce((s, sub) => s + sub.maxMarks, 0);
    const targetTotal = Math.round(totalMax * (pct / 100));
    let low = 40, high = 80;
    if (pct < 40) { low = pct - 10; high = pct + 15; }
    else if (pct > 80) { low = pct - 15; high = pct + 10; }
    const generated = {};
    let sum = 0;
    subjects.forEach(sub => {
      const f = sub.maxMarks / 100;
      const v = Math.floor(Math.random() * (Math.round(high * f) - Math.round(low * f) + 1)) + Math.round(low * f);
      generated[sub.code] = v; sum += v;
    });
    let diff = targetTotal - sum, attempts = 0;
    while (diff !== 0 && attempts < 1000) {
      attempts++;
      const indices = Array.from({ length: subjects.length }, (_, i) => i).sort(() => Math.random() - 0.5);
      for (const idx of indices) {
        if (diff === 0) break;
        const sub = subjects[idx], f = sub.maxMarks / 100;
        const lo = Math.round(low * f), hi = Math.round(high * f);
        if (diff > 0 && generated[sub.code] < hi) { generated[sub.code]++; diff--; }
        else if (diff < 0 && generated[sub.code] > lo) { generated[sub.code]--; diff++; }
      }
    }
    setFormMarksheets(prev => ({ ...prev, [selectedTerm]: generated }));
  };

  const handlePortalSearch = async () => {
    setPortalError('');
    setPortalStudent(null);
    setPortalCourse(null);
    if (!portalName.trim() || !portalSearchVal.trim()) {
      setPortalError('Please enter both student name and Roll/Enrollment number.');
      return;
    }

    const n = portalName.trim().toLowerCase();
    const q = portalSearchVal.trim().toLowerCase();

    const found = students.find(s => {
      const nameMatch = s.name?.toLowerCase().includes(n);
      const rollMatch = String(s.rollNo)?.toLowerCase() === q;
      const enrollMatch = s.enrollmentNo?.toLowerCase() === q;
      return nameMatch && (rollMatch || enrollMatch);
    });

    if (found) {
      const course = courses.find(c => c.name === found.course);
      setPortalStudent(found);
      setPortalCourse(course || { name: found.course, terms: {} });
      const terms = Object.keys(found.marksheets || {});
      setPortalActiveTerm(terms[0] || '');
      setPortalActiveTab('marksheet');
    } else {
      setPortalError('No student record found matching the provided credentials. Please check the spelling and Roll/Enrollment Number.');
    }
  };

  const filteredStudents = students.filter(s => {
    const mc = searchCourse ? s.course?.toLowerCase().includes(searchCourse.toLowerCase()) : true;
    const ms = searchSession ? s.session?.toLowerCase().includes(searchSession.toLowerCase()) : true;
    return mc && ms;
  });

  const centerFilteredStudents = students.filter(s => {
    const matchSearch = centerSearch ? (
      s.name?.toLowerCase().includes(centerSearch.toLowerCase()) ||
      String(s.rollNo)?.includes(centerSearch) ||
      s.enrollmentNo?.toLowerCase().includes(centerSearch.toLowerCase())
    ) : true;
    const matchCourse = centerCourseFilter ? s.course?.toLowerCase().includes(centerCourseFilter.toLowerCase()) : true;
    const matchSession = centerSessionFilter ? s.session?.toLowerCase().includes(centerSessionFilter.toLowerCase()) : true;
    return matchSearch && matchCourse && matchSession;
  });

  return (
    <div className={`app-root-container no-print ${currentView === 'portal' ? 'portal-view' : 'admin-view'}`}>
      
      {/* HEADER BAR */}
      <header className="admin-header">
        <img src="Monogram.png" alt="DSVV" className="logo-monogram-top" />
        <div className="header-brand">
          <h1 className="header-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
          <p className="header-univ-sub">RAIPUR, CHHATTISGARH &bull; ADMINISTRATIVE SYSTEMS</p>
        </div>
        <nav className="header-nav-actions">
          <button className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`} onClick={() => { setCurrentView('admin'); }}>
            <Sliders size={16} /> Admin Portal
          </button>
          <button className={`nav-mode-btn ${currentView === 'center' ? 'active' : ''}`} onClick={() => { setCurrentView('center'); }}>
            <Building2 size={16} /> Center Portal
          </button>
          <button className={`nav-mode-btn ${currentView === 'portal' ? 'active' : ''}`} onClick={() => { setCurrentView('portal'); setPortalStudent(null); setPortalError(''); }}>
            <Globe size={16} /> Result Portal
          </button>
          <a href="../index.html" className="nav-mode-btn" style={{ textDecoration: 'none' }}>
            <Home size={16} /> Main Website
          </a>
        </nav>
      </header>

      {/* ADMIN PORTAL VIEW */}
      {currentView === 'admin' && (
        <div className="admin-view-wrapper">
          <aside className="dashboard-sidebar no-print">
            <ul className="sidebar-nav-list">
              <li className={`sidebar-link ${adminTab === 'dashboard' ? 'active' : ''}`} onClick={() => setAdminTab('dashboard')}>
                <Eye className="sidebar-link-icon" size={20} /><span>Dashboard List</span>
              </li>
              <li className={`sidebar-link ${adminTab === 'add-student' ? 'active' : ''}`} onClick={() => { resetForm(); setAdminTab('add-student'); }}>
                <UserPlus className="sidebar-link-icon" size={20} /><span>Add Student</span>
              </li>
              <li className={`sidebar-link ${adminTab === 'courses' ? 'active' : ''}`} onClick={() => setAdminTab('courses')}>
                <BookOpen className="sidebar-link-icon" size={20} /><span>Course Manager</span>
              </li>
            </ul>
            <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 20px' }}>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Students: {students.length} | Courses: {courses.length}</span>
            </div>
          </aside>

          <main className="admin-content-panel">
            {/* DASHBOARD */}
            {adminTab === 'dashboard' && (
              <div className="tab-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0 }}>Student Records Dashboard</h2>
                  <button className="btn-primary" onClick={() => { resetForm(); setAdminTab('add-student'); }}><UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Register Student</button>
                </div>
                
                <div className="search-filters" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Filter by Course..." value={searchCourse} onChange={e => setSearchCourse(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Filter by Session..." value={searchSession} onChange={e => setSearchSession(e.target.value)} />
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px' }}>
                    <User size={48} style={{ color: '#ccc', marginBottom: '10px' }} />
                    <p>No student records found.</p>
                  </div>
                ) : (
                  <div className="student-grid">
                    {filteredStudents.map(s => (
                      <div key={s.id} className="student-card">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="student-card-photo" />
                        ) : (
                          <div className="student-card-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                            <User size={32} style={{ color: '#9ca3af' }} />
                          </div>
                        )}
                        <h3 className="student-card-name">{s.name}</h3>
                        <div className="student-card-detail">
                          <p>Course: <strong>{s.course}</strong></p>
                          <p>Session: {s.session}</p>
                          <p>Enrollment: {s.enrollmentNo}</p>
                        </div>
                        <span className="student-card-roll">Roll No: {s.rollNo}</span>
                        <div className="student-card-actions">
                          <button className="btn-view" onClick={() => { setActiveDocStudent(s); const c = courses.find(x => x.name === s.course); setActiveDocTerm(getTermNames(c)[0] || ''); }}><Printer size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Documents</button>
                          <button className="btn-edit" onClick={() => startEdit(s, false)}><Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteStudent(s.id)}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADD/EDIT STUDENT */}
            {adminTab === 'add-student' && (
              <div className="form-container">
                <h2>{editingStudentId ? 'Edit Student Details' : 'Register New Student'}</h2>
                <form onSubmit={handleSaveStudent}>
                  <div className="form-grid">
                    <div className="form-group"><label>Student Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>Father Name *</label><input value={formData.fatherName} onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>Mother Name *</label><input value={formData.motherName} onChange={e => setFormData(p => ({ ...p, motherName: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>DOB (DD/MM/YYYY) *</label><input value={formData.dob} placeholder="DD/MM/YYYY" maxLength={10} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); let f = ''; if (d.length > 0) f = d.slice(0, 2); if (d.length > 2) f += '/' + d.slice(2, 4); if (d.length > 4) f += '/' + d.slice(4); setFormData(p => ({ ...p, dob: f })); }} required /></div>
                    <div className="form-group"><label>Course *</label>
                      <select value={formData.courseName} onChange={e => { setFormData(p => ({ ...p, courseName: e.target.value })); setSelectedTerm(''); }} required>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Session *</label><input value={formData.session} onChange={e => setFormData(p => ({ ...p, session: e.target.value.toUpperCase() }))} placeholder="e.g. 2023-2026" required /></div>
                  </div>

                  {/* Photo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <div className="photo-upload-area">
                      {formData.photo ? <img src={formData.photo} alt="Preview" className="photo-preview" /> : <div className="upload-text"><Image size={24} /><br />Photo</div>}
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = () => setCropSrc(r.result); r.readAsDataURL(e.target.files[0]); } }} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px' }}>Passport Size Photo</strong>
                      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>Click the circle to upload and crop candidate photo.</p>
                    </div>
                  </div>

                  {/* Marks Entry */}
                  {formData.courseName && (
                    <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3>Subject Marks Entry</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            {getTermNames(courses.find(c => c.name === formData.courseName)).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button type="button" className="btn-secondary" onClick={generateMarks}>Auto Fill Marks</button>
                        </div>
                      </div>
                      <table className="marks-entry-table">
                        <thead><tr><th>Code</th><th>Subject</th><th>Min</th><th>Max</th><th>Obtained</th></tr></thead>
                        <tbody>
                          {getTermSubjects(courses.find(c => c.name === formData.courseName), selectedTerm).map(sub => (
                            <tr key={sub.code}>
                              <td>{sub.code}</td><td>{sub.name}</td><td>{sub.minMarks}</td><td>{sub.maxMarks}</td>
                              <td><input type="number" min={0} max={sub.maxMarks} value={formMarksheets[selectedTerm]?.[sub.code] ?? ''} onChange={e => handleMarkChange(sub.code, e.target.value, sub.maxMarks)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => { resetForm(); setAdminTab('dashboard'); }}>Cancel</button>
                    <button type="submit" className="btn-primary">{editingStudentId ? 'Update Student' : 'Save & Register'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* COURSE MANAGER */}
            {adminTab === 'courses' && (
              <div>
                <h2>Course CSV Manager</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
                  <div className="form-container">
                    <h3>Upload New Course CSV</h3>
                    <form onSubmit={handleCsvUpload}>
                      <div className="csv-upload-zone" onClick={() => document.getElementById('csvFileInput').click()}>
                        <UploadCloud className="upload-icon" />
                        <span className="upload-label">Click to select CSV File</span>
                        <span className="upload-hint">Supports Semester-wise & Year-wise CSV structure</span>
                        <input id="csvFileInput" type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { setCsvFile(e.target.files[0]); setCsvMessage(''); } }} />
                      </div>
                      {csvFile && <p style={{ margin: '10px 0', fontSize: '13px' }}>Selected file: <strong>{csvFile.name}</strong></p>}
                      <div style={{ marginTop: '16px' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}><UploadCloud size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Process & Import CSV</button>
                      </div>
                      {csvMessage && <div style={{ marginTop: '12px', padding: '10px', borderRadius: '4px', background: csvMessage.includes('Success') || csvMessage.includes('Successfully') ? '#dcfce7' : '#fee2e2', color: csvMessage.includes('Success') || csvMessage.includes('Successfully') ? '#166534' : '#991b1b', fontSize: '13px' }}>{csvMessage}</div>}
                    </form>
                  </div>

                  <div className="form-container">
                    <h3>Available Courses ({courses.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                      {courses.map(c => (
                        <div key={c.name} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
                          <strong style={{ color: '#0d2149' }}>{c.name}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Type: {c.type?.toUpperCase()} | Terms: {Object.keys(c.terms || {}).length}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* CENTER PORTAL VIEW */}
      {currentView === 'center' && (
        <main className="admin-content-panel" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0d2149' }}><Building2 size={24} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#d4af37' }} /> Examination Center Workspace</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Generate & Print Student Admit Cards, Marksheets, and Verification Records</p>
              </div>
              <button className="btn-primary" onClick={() => window.print()}><Printer size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Batch Print View</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <input style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} placeholder="Search Student Name / Roll No..." value={centerSearch} onChange={e => setCenterSearch(e.target.value)} />
              <select style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} value={centerCourseFilter} onChange={e => setCenterCourseFilter(e.target.value)}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <input style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} placeholder="Filter Session..." value={centerSessionFilter} onChange={e => setCenterSessionFilter(e.target.value)} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '16px' }}>Enrolled Students ({centerFilteredStudents.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#0d2149', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px' }}>Roll No</th>
                    <th style={{ padding: '10px 14px' }}>Student Name</th>
                    <th style={{ padding: '10px 14px' }}>Course</th>
                    <th style={{ padding: '10px 14px' }}>Session</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Admit Card</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Marksheet</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {centerFilteredStudents.map((s, idx) => {
                    const c = courses.find(x => x.name === s.course);
                    const firstTerm = getTermNames(c)[0] || '';
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>{s.rollNo}</td>
                        <td style={{ padding: '10px 14px' }}>{s.name}</td>
                        <td style={{ padding: '10px 14px' }}>{s.course}</td>
                        <td style={{ padding: '10px 14px' }}>{s.session}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button className="btn-view" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => { setActiveDocStudent(s); setActiveDocTerm(firstTerm); setActiveDocTab('admit'); }}>
                            <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Admit Card
                          </button>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button className="btn-view" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => { setActiveDocStudent(s); setActiveDocTerm(firstTerm); setActiveDocTab('marksheet'); }}>
                            <FileText size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Marksheet
                          </button>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button className="btn-view" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => { setActiveDocStudent(s); setActiveDocTerm(firstTerm); setActiveDocTab('result'); }}>
                            <Globe size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Result
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* STUDENT RESULT PORTAL VIEW (LIGHT THEME) */}
      {currentView === 'portal' && (
        <main className="portal-container">
          {!portalStudent ? (
            <div className="portal-search">
              <div className="portal-logo">
                <img src="Monogram.png" alt="DSVV" />
                <h1>DEV SANSKRITI VISHWAVIDYALAYA</h1>
                <h2>STUDENT ONLINE DOCUMENT VERIFICATION HUB</h2>
              </div>
              <div className="portal-form">
                <div className="input-group">
                  <User size={20} />
                  <input placeholder="Student Full Name (e.g. AASHISH BAGH)" value={portalName} onChange={e => setPortalName(e.target.value)} />
                </div>
                <div className="input-group">
                  <FileText size={20} />
                  <input placeholder="Roll Number or Enrollment Number" value={portalSearchVal} onChange={e => setPortalSearchVal(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={handlePortalSearch} disabled={loading}>
                  <Search size={18} /> {loading ? 'Searching...' : 'Search Record'}
                </button>
                {portalError && <div className="portal-error"><AlertCircle size={18} /> {portalError}</div>}
              </div>
            </div>
          ) : (
            <div className="portal-hub">
              <div className="portal-hub-header">
                <button className="btn-outline" onClick={() => { setPortalStudent(null); setPortalCourse(null); }}>
                  <ArrowLeft size={16} /> Back to Search
                </button>
                <div className="hub-info">
                  <div className="hub-photo">
                    {portalStudent.photo ? <img src={portalStudent.photo} alt="" /> : <User size={48} style={{ color: '#9ca3af' }} />}
                  </div>
                  <div>
                    <h2>{portalStudent.name}</h2>
                    <p>Course: <strong>{portalStudent.course}</strong></p>
                    <p>Roll No: <strong>{portalStudent.rollNo}</strong> | Enrollment: <strong>{portalStudent.enrollmentNo}</strong></p>
                    <p>Session: <strong>{portalStudent.session}</strong></p>
                  </div>
                </div>
              </div>
              
              <div className="portal-docs-workspace">
                <div className="portal-docs-sidebar">
                  <select value={portalActiveTerm} onChange={e => setPortalActiveTerm(e.target.value)}>
                    {Object.keys(portalStudent.marksheets || {}).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button className={`doc-tab ${portalActiveTab === 'marksheet' ? 'active' : ''}`} onClick={() => setPortalActiveTab('marksheet')}>
                    <FileText size={18} /> Marksheet
                  </button>
                  <button className={`doc-tab ${portalActiveTab === 'admit' ? 'active' : ''}`} onClick={() => setPortalActiveTab('admit')}>
                    <Calendar size={18} /> Admit Card
                  </button>
                  <button className={`doc-tab ${portalActiveTab === 'result' ? 'active' : ''}`} onClick={() => setPortalActiveTab('result')}>
                    <Globe size={18} /> Online Result
                  </button>
                  <button className="btn-primary" onClick={() => window.print()}>
                    <Printer size={18} /> Print Document
                  </button>
                </div>
                
                <div className="portal-doc-preview">
                  {portalActiveTab === 'marksheet' && <MarksheetTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
                  {portalActiveTab === 'admit' && <AdmitCardTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
                  {portalActiveTab === 'result' && <OnlineResultTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* DOCUMENT MODAL (ADMIN / CENTER VIEW) */}
      {activeDocStudent && (
        <div className="modal-overlay" onClick={() => setActiveDocStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>{activeDocStudent.name} - Documents</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={activeDocTerm} onChange={e => setActiveDocTerm(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {getTermNames(courses.find(c => c.name === activeDocStudent.course)).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="btn-primary" onClick={() => window.print()}><Printer size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Print</button>
                <button className="modal-close-btn" onClick={() => setActiveDocStudent(null)}><X size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button className={`nav-mode-btn ${activeDocTab === 'marksheet' ? 'active' : ''}`} onClick={() => setActiveDocTab('marksheet')}>Marksheet</button>
              <button className={`nav-mode-btn ${activeDocTab === 'admit' ? 'active' : ''}`} onClick={() => setActiveDocTab('admit')}>Admit Card</button>
              <button className={`nav-mode-btn ${activeDocTab === 'result' ? 'active' : ''}`} onClick={() => setActiveDocTab('result')}>Online Result</button>
            </div>

            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
              {activeDocTab === 'marksheet' && <MarksheetTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
              {activeDocTab === 'admit' && <AdmitCardTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
              {activeDocTab === 'result' && <OnlineResultTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
            </div>
          </div>
        </div>
      )}

      {/* PHOTO CROPPER MODAL */}
      {cropSrc && (
        <ImageCropper src={cropSrc} onCropComplete={(base64) => {
          setFormData(p => ({ ...p, photo: base64 }));
          setCropSrc(null);
        }} onCancel={() => setCropSrc(null)} />
      )}

      {/* PRINT CONTAINER */}
      <div className="print-only-container" style={{ display: 'none' }}>
        {activeDocStudent && activeDocTab === 'marksheet' && <MarksheetTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
        {activeDocStudent && activeDocTab === 'admit' && <AdmitCardTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
        {activeDocStudent && activeDocTab === 'result' && <OnlineResultTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
        {portalStudent && portalActiveTab === 'marksheet' && <MarksheetTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
        {portalStudent && portalActiveTab === 'admit' && <AdmitCardTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
        {portalStudent && portalActiveTab === 'result' && <OnlineResultTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
      </div>

    </div>
  );
}
