import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, UploadCloud, FileText, Calendar,
  Edit3, Trash2, Globe, Sliders, CheckCircle, Eye,
  Printer, ArrowLeft, User, Image, BookOpen,
  RefreshCw, X, AlertCircle, Building2, Home, Lock,
  LogOut, Check, Ban, Mail, Phone, ShieldCheck, UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MarksheetTemplate from './components/MarksheetTemplate';
import AdmitCardTemplate from './components/AdmitCardTemplate';
import OnlineResultTemplate from './components/OnlineResultTemplate';
import ImageCropper from './components/ImageCropper';
import { DEFAULT_COURSES, DEFAULT_STUDENTS, DEFAULT_CENTERS, parseCSVClient } from './defaultData';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return v === 'admin' || v === 'center' || v === 'portal' ? v : 'portal';
  });

  // Data State
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('dsvv_courses');
    return saved ? JSON.parse(saved) : DEFAULT_COURSES;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('dsvv_students');
    return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
  });

  const [centers, setCenters] = useState(() => {
    const saved = localStorage.getItem('dsvv_centers');
    return saved ? JSON.parse(saved) : DEFAULT_CENTERS;
  });

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('dsvv_admin_logged_in') === 'true';
  });
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Center Auth State
  const [loggedCenter, setLoggedCenter] = useState(() => {
    const saved = sessionStorage.getItem('dsvv_center_logged_in');
    return saved ? JSON.parse(saved) : null;
  });
  const [centerCodeInput, setCenterCodeInput] = useState('');
  const [centerPasswordInput, setCenterPasswordInput] = useState('');
  const [centerLoginError, setCenterLoginError] = useState('');
  const [showCenterRegisterModal, setShowCenterRegisterModal] = useState(false);
  const [newCenterForm, setNewCenterForm] = useState({
    centerName: '',
    centerCode: '',
    coordinatorName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [centerRegisterSuccessMsg, setCenterRegisterSuccessMsg] = useState('');

  // General App State
  const [loading, setLoading] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSession, setSearchSession] = useState('');
  
  // Student Form State (Matching Reference UI)
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    courseName: '',
    session: '',
    email: '',
    rollNo: '',
    enrollmentNo: '',
    photo: ''
  });
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

  // Center Workspace State
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
    localStorage.setItem('dsvv_centers', JSON.stringify(centers));
  }, [centers]);

  const getNextSequentialNumbers = (sessionStr) => {
    const lastRoll = students.reduce((max, s) => Math.max(max, parseInt(s.rollNo) || 230000), 231450);
    const nextRoll = lastRoll + 1;
    const sessionYear = parseInt((sessionStr || '').match(/\b(20\d{2})\b/)?.[0] || '2024');
    const nextEnroll = `${sessionYear - 1}${nextRoll}`;
    return { nextRoll, nextEnroll };
  };

  const getTermNames = (course) => course ? Object.keys(course.terms || {}) : [];
  const getTermSubjects = (course, term) => (course && course.terms && course.terms[term]) || [];

  // Admin Auth Handlers
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    const u = adminUsernameInput.trim();
    const p = adminPasswordInput.trim();

    if (u.toUpperCase() === 'DEV SANSKRITI VISHWAVIDHLAYA' && p === 'dsvv@2026') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('dsvv_admin_logged_in', 'true');
      setAdminUsernameInput('');
      setAdminPasswordInput('');
    } else {
      setAdminLoginError('Invalid Administrator Username or Password.');
    }
  };

  const handleAdminSignOut = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('dsvv_admin_logged_in');
    setAdminTab('dashboard');
  };

  // Center Auth Handlers
  const handleCenterLogin = (e) => {
    e.preventDefault();
    setCenterLoginError('');
    const q = centerCodeInput.trim().toUpperCase();
    const p = centerPasswordInput.trim();

    const center = centers.find(c => 
      (c.centerCode.toUpperCase() === q || c.email.toUpperCase() === q) && c.password === p
    );

    if (!center) {
      setCenterLoginError('Invalid Center ID / Email or Password.');
      return;
    }

    if (center.status === 'pending') {
      setCenterLoginError('Your Center account is currently pending approval by the University Administrator.');
      return;
    }

    if (center.status === 'rejected') {
      setCenterLoginError('Your Center registration was rejected by the University Administrator.');
      return;
    }

    setLoggedCenter(center);
    sessionStorage.setItem('dsvv_center_logged_in', JSON.stringify(center));
    setCenterCodeInput('');
    setCenterPasswordInput('');
  };

  const handleCenterSignOut = () => {
    setLoggedCenter(null);
    sessionStorage.removeItem('dsvv_center_logged_in');
  };

  const handleRegisterCenterSubmit = (e) => {
    e.preventDefault();
    if (!newCenterForm.centerName || !newCenterForm.centerCode || !newCenterForm.password) {
      alert('Please fill in all mandatory center details.');
      return;
    }

    const exists = centers.some(c => c.centerCode.toUpperCase() === newCenterForm.centerCode.trim().toUpperCase());
    if (exists) {
      alert('A center with this Center ID / Code already exists. Please choose a different code.');
      return;
    }

    const newCenter = {
      id: `ctr-${Date.now()}`,
      centerName: newCenterForm.centerName.trim().toUpperCase(),
      centerCode: newCenterForm.centerCode.trim().toUpperCase(),
      coordinatorName: newCenterForm.coordinatorName.trim().toUpperCase(),
      email: newCenterForm.email.trim(),
      phone: newCenterForm.phone.trim(),
      password: newCenterForm.password.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCenters(prev => [newCenter, ...prev]);
    setShowCenterRegisterModal(false);
    setNewCenterForm({ centerName: '', centerCode: '', coordinatorName: '', email: '', phone: '', password: '' });
    setCenterRegisterSuccessMsg('Center Registration Submitted! Your ID will become active after approval by University Administrator.');
  };

  const handleApproveCenter = (centerId) => {
    setCenters(prev => prev.map(c => c.id === centerId ? { ...c, status: 'approved' } : c));
    confetti({ particleCount: 60, spread: 50 });
  };

  const handleRejectCenter = (centerId) => {
    setCenters(prev => prev.map(c => c.id === centerId ? { ...c, status: 'rejected' } : c));
  };

  const handleDeleteCenter = (centerId) => {
    if (!confirm('Delete this examination center record?')) return;
    setCenters(prev => prev.filter(c => c.id !== centerId));
  };

  // Student Form Handlers
  const resetForm = () => {
    const { nextRoll, nextEnroll } = getNextSequentialNumbers('2024-2026');
    setFormData({
      name: '',
      fatherName: '',
      motherName: '',
      dob: '',
      courseName: '',
      session: '2024-2026',
      email: '',
      rollNo: nextRoll,
      enrollmentNo: nextEnroll,
      photo: ''
    });
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
      email: student.email || '',
      rollNo: student.rollNo,
      enrollmentNo: student.enrollmentNo,
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
    
    terms.forEach((t) => {
      const existing = editingStudentId ? students.find(s => s.id === editingStudentId)?.marksheets?.[t] : null;
      marksheetsData[t] = {
        dmcNo: existing?.dmcNo || Math.floor(1000 + Math.random() * 9000),
        issueDate: existing?.issueDate || '28-02-2026',
        marks: formMarksheets[t] || {}
      };
    });

    const publishedDocs = { marksheets: {}, admitCards: {}, results: {} };
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
      newStudent = {
        id: `std-${Date.now()}`,
        name: formData.name,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        course: formData.courseName,
        session: formData.session,
        email: formData.email,
        photo: formData.photo,
        rollNo: formData.rollNo,
        enrollmentNo: formData.enrollmentNo,
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
          <button className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`} onClick={() => setCurrentView('admin')}>
            <Sliders size={16} /> Admin Portal
          </button>
          <button className={`nav-mode-btn ${currentView === 'center' ? 'active' : ''}`} onClick={() => setCurrentView('center')}>
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

      {/* ============================================================
          1. ADMIN PORTAL VIEW
         ============================================================ */}
      {currentView === 'admin' && (
        !isAdminLoggedIn ? (
          /* Admin Login Screen */
          <main className="portal-container" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="portal-search" style={{ maxWidth: '440px' }}>
              <div className="portal-logo">
                <img src="Monogram.png" alt="DSVV" style={{ height: '70px', marginBottom: '12px' }} />
                <h1 style={{ fontSize: '1.2rem', color: '#0d2149' }}>ADMINISTRATOR LOGIN</h1>
                <h2 style={{ fontSize: '0.8rem', color: '#d4af37' }}>DEV SANSKRITI VISHWAVIDYALAYA</h2>
              </div>
              <form onSubmit={handleAdminLogin} className="portal-form">
                <div className="input-group">
                  <User size={20} />
                  <input 
                    placeholder="Admin Username" 
                    value={adminUsernameInput} 
                    onChange={e => setAdminUsernameInput(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <Lock size={20} />
                  <input 
                    type="password" 
                    placeholder="Admin Password" 
                    value={adminPasswordInput} 
                    onChange={e => setAdminPasswordInput(e.target.value)} 
                    required 
                  />
                </div>
                {adminLoginError && <div className="portal-error"><AlertCircle size={16} /> {adminLoginError}</div>}
                <button type="submit" className="btn-primary" style={{ background: '#0d2149', marginTop: '8px' }}>
                  <ShieldCheck size={18} /> Sign In as Administrator
                </button>
              </form>
            </div>
          </main>
        ) : (
          /* Logged-in Admin Workspace */
          <div className="admin-view-wrapper">
            <aside className="dashboard-sidebar no-print">
              <div className="sidebar-heading">Navigator</div>
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
                <li className={`sidebar-link ${adminTab === 'centers' ? 'active' : ''}`} onClick={() => setAdminTab('centers')}>
                  <Building2 className="sidebar-link-icon" size={20} /><span>Center Admissions</span>
                </li>
              </ul>
              
              <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button 
                  onClick={handleAdminSignOut} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
                  DB status: Connected
                </div>
              </div>
            </aside>

            <main className="admin-content-panel">
              {/* DASHBOARD TAB */}
              {adminTab === 'dashboard' && (
                <div className="tab-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0d2149' }}>Student Records Dashboard</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Total registered students: {students.length}</p>
                    </div>
                    <button className="btn-primary" onClick={() => { resetForm(); setAdminTab('add-student'); }}>
                      <UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Add Student
                    </button>
                  </div>
                  
                  <div className="search-filters" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
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
                            <button className="btn-view" onClick={() => { setActiveDocStudent(s); const c = courses.find(x => x.name === s.course); setActiveDocTerm(getTermNames(c)[0] || ''); }}>
                              <Printer size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Documents
                            </button>
                            <button className="btn-edit" onClick={() => startEdit(s, false)}>
                              <Edit3 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                            </button>
                            <button className="btn-delete" onClick={() => handleDeleteStudent(s.id)}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REGISTER NEW STUDENT (EXACT REFERENCE UI) */}
              {adminTab === 'add-student' && (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: '1000px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                      {editingStudentId ? 'Edit Student Details' : 'Register New Student'}
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      Sequential Roll/Enrollment numbering will auto-apply.
                    </p>
                  </div>

                  <form onSubmit={handleSaveStudent}>
                    {/* Row 1: Student Name, Father's Name, Mother's Name (3 columns) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>STUDENT NAME</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          value={formData.name} 
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>FATHER'S NAME</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          value={formData.fatherName} 
                          onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value.toUpperCase() }))} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>MOTHER'S NAME</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          value={formData.motherName} 
                          onChange={e => setFormData(p => ({ ...p, motherName: e.target.value.toUpperCase() }))} 
                          required 
                        />
                      </div>
                    </div>

                    {/* Row 2: DOB, Course, Session, Email (4 columns) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>DATE OF BIRTH (DD/MM/YYYY)</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          placeholder="DD/MM/YYYY" 
                          maxLength={10} 
                          value={formData.dob} 
                          onChange={e => {
                            const d = e.target.value.replace(/\D/g, '').slice(0, 8);
                            let f = '';
                            if (d.length > 0) f = d.slice(0, 2);
                            if (d.length > 2) f += '/' + d.slice(2, 4);
                            if (d.length > 4) f += '/' + d.slice(4);
                            setFormData(p => ({ ...p, dob: f }));
                          }} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>COURSE</label>
                        <select 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
                          value={formData.courseName} 
                          onChange={e => { setFormData(p => ({ ...p, courseName: e.target.value })); setSelectedTerm(''); }} 
                          required
                        >
                          <option value="">{courses.length === 0 ? 'No courses parsed. Upload CSV first.' : 'Select Course'}</option>
                          {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>SESSION (FINAL END YEAR)</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          placeholder="e.g. 2026 FINAL or 2024-2026" 
                          value={formData.session} 
                          onChange={e => setFormData(p => ({ ...p, session: e.target.value.toUpperCase() }))} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>EMAIL ID</label>
                        <input 
                          type="email"
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                          placeholder="student@example.com" 
                          value={formData.email} 
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
                        />
                      </div>
                    </div>

                    {/* Row 3: Roll Number, Enrollment Number (2 columns) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>ROLL NUMBER</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                          value={formData.rollNo} 
                          onChange={e => setFormData(p => ({ ...p, rollNo: e.target.value }))} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.05em' }}>ENROLLMENT NUMBER</label>
                        <input 
                          style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                          value={formData.enrollmentNo} 
                          onChange={e => setFormData(p => ({ ...p, enrollmentNo: e.target.value }))} 
                          required 
                        />
                      </div>
                    </div>

                    {/* Row 4: Photo Upload with Preview & Crop */}
                    <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {formData.photo ? (
                          <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Image size={32} style={{ color: '#94a3b8' }} />
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                          UPLOAD STUDENT PHOTO (FREE CROP)
                        </label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => {
                            if (e.target.files[0]) {
                              const r = new FileReader();
                              r.onload = () => setCropSrc(r.result);
                              r.readAsDataURL(e.target.files[0]);
                            }
                          }} 
                        />
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                          Upload an image and crop it using our built-in precision cropping tool.
                        </p>
                      </div>
                    </div>

                    {/* Marks Entry (if Course Selected) */}
                    {formData.courseName && (
                      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0d2149' }}>Subject Marks Entry</h3>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <select 
                              value={selectedTerm} 
                              onChange={e => setSelectedTerm(e.target.value)} 
                              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                              {getTermNames(courses.find(c => c.name === formData.courseName)).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
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
                                <td>
                                  <input 
                                    type="number" 
                                    min={0} 
                                    max={sub.maxMarks} 
                                    value={formMarksheets[selectedTerm]?.[sub.code] ?? ''} 
                                    onChange={e => handleMarkChange(sub.code, e.target.value, sub.maxMarks)} 
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => { resetForm(); setAdminTab('dashboard'); }}
                        style={{ padding: '10px 24px', borderRadius: '8px' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary"
                        style={{ padding: '10px 28px', borderRadius: '8px', background: '#0f172a' }}
                      >
                        {editingStudentId ? 'Update Student Details' : 'Save & Register Student'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* COURSE MANAGER TAB */}
              {adminTab === 'courses' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', color: '#0d2149', marginBottom: '20px' }}>Course CSV Manager</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
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
                          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            <UploadCloud size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Process & Import CSV
                          </button>
                        </div>
                        {csvMessage && (
                          <div style={{ marginTop: '12px', padding: '10px', borderRadius: '4px', background: csvMessage.includes('Success') || csvMessage.includes('Successfully') ? '#dcfce7' : '#fee2e2', color: csvMessage.includes('Success') || csvMessage.includes('Successfully') ? '#166534' : '#991b1b', fontSize: '13px' }}>
                            {csvMessage}
                          </div>
                        )}
                      </form>
                    </div>

                    <div className="form-container">
                      <h3>Available Courses ({courses.length})</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                        {courses.map(c => (
                          <div key={c.name} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                            <strong style={{ color: '#0d2149', fontSize: '14px' }}>{c.name}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Type: {c.type?.toUpperCase()} | Terms: {Object.keys(c.terms || {}).length}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CENTER ADMISSIONS & APPROVALS TAB */}
              {adminTab === 'centers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0d2149' }}>Examination Center Admissions & Approvals</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Approve registered study centers to grant access to the Center Portal</p>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {centers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Building2 size={48} style={{ color: '#ccc', marginBottom: '10px' }} />
                        <p>No examination centers registered yet.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <thead>
                            <tr style={{ background: '#0d2149', color: '#fff', textAlign: 'left' }}>
                              <th style={{ padding: '12px 14px' }}>Center Code</th>
                              <th style={{ padding: '12px 14px' }}>Center Name</th>
                              <th style={{ padding: '12px 14px' }}>Coordinator</th>
                              <th style={{ padding: '12px 14px' }}>Contact</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {centers.map((c, idx) => (
                              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                                <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0d2149' }}>{c.centerCode}</td>
                                <td style={{ padding: '12px 14px', fontWeight: '600' }}>{c.centerName}</td>
                                <td style={{ padding: '12px 14px' }}>{c.coordinatorName || '—'}</td>
                                <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748b' }}>
                                  <div>{c.email}</div>
                                  <div>{c.phone}</div>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    background: c.status === 'approved' ? '#dcfce7' : c.status === 'pending' ? '#fef9c3' : '#fee2e2',
                                    color: c.status === 'approved' ? '#166534' : c.status === 'pending' ? '#854d0e' : '#991b1b'
                                  }}>
                                    {c.status}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                    {c.status !== 'approved' && (
                                      <button 
                                        className="btn-primary" 
                                        style={{ padding: '5px 10px', fontSize: '11px', background: '#16a34a' }}
                                        onClick={() => handleApproveCenter(c.id)}
                                        title="Approve Center"
                                      >
                                        <Check size={14} style={{ verticalAlign: 'middle' }} /> Approve
                                      </button>
                                    )}
                                    {c.status === 'approved' && (
                                      <button 
                                        className="btn-secondary" 
                                        style={{ padding: '5px 10px', fontSize: '11px', color: '#dc2626' }}
                                        onClick={() => handleRejectCenter(c.id)}
                                        title="Revoke Approval"
                                      >
                                        <Ban size={14} style={{ verticalAlign: 'middle' }} /> Revoke
                                      </button>
                                    )}
                                    <button 
                                      className="btn-delete" 
                                      style={{ padding: '5px 8px' }}
                                      onClick={() => handleDeleteCenter(c.id)}
                                      title="Delete Record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        )
      )}

      {/* ============================================================
          2. CENTER PORTAL VIEW
         ============================================================ */}
      {currentView === 'center' && (
        !loggedCenter ? (
          /* Center Login Screen */
          <main className="portal-container" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="portal-search" style={{ maxWidth: '460px' }}>
              <div className="portal-logo">
                <Building2 size={48} style={{ color: '#d4af37', marginBottom: '10px' }} />
                <h1 style={{ fontSize: '1.2rem', color: '#0d2149' }}>EXAMINATION CENTER LOGIN</h1>
                <h2 style={{ fontSize: '0.8rem', color: '#10b981' }}>DEV SANSKRITI VISHWAVIDYALAYA</h2>
              </div>

              {centerRegisterSuccessMsg && (
                <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '13px' }}>
                  {centerRegisterSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCenterLogin} className="portal-form">
                <div className="input-group">
                  <Building2 size={20} />
                  <input 
                    placeholder="Center ID / Code or Email" 
                    value={centerCodeInput} 
                    onChange={e => setCenterCodeInput(e.target.value)} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <Lock size={20} />
                  <input 
                    type="password" 
                    placeholder="Center Password" 
                    value={centerPasswordInput} 
                    onChange={e => setCenterPasswordInput(e.target.value)} 
                    required 
                  />
                </div>
                {centerLoginError && <div className="portal-error"><AlertCircle size={16} /> {centerLoginError}</div>}
                
                <button type="submit" className="btn-primary" style={{ background: '#10b981', marginTop: '8px' }}>
                  <UserCheck size={18} /> Sign In to Center Portal
                </button>
              </form>

              <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px' }}>Don't have an Examination Center ID?</p>
                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ width: '100%', fontSize: '13px', padding: '10px' }}
                  onClick={() => { setShowCenterRegisterModal(true); setCenterRegisterSuccessMsg(''); setCenterLoginError(''); }}
                >
                  <Building2 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Create New Center ID / Register Center
                </button>
              </div>
            </div>
          </main>
        ) : (
          /* Logged-in Center Workspace */
          <main className="admin-content-panel" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, color: '#0d2149' }}>{loggedCenter.centerName}</h2>
                    <span style={{ padding: '2px 8px', background: '#d4af37', color: '#0d2149', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {loggedCenter.centerCode}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Coordinator: <strong>{loggedCenter.coordinatorName || 'Center Head'}</strong> &bull; Examination Center Workspace
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => window.print()}>
                    <Printer size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Batch Print
                  </button>
                  <button className="btn-secondary" onClick={handleCenterSignOut} style={{ color: '#dc2626' }}>
                    <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Sign Out
                  </button>
                </div>
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
              <h3 style={{ marginBottom: '16px' }}>Enrolled Candidate Documents ({centerFilteredStudents.length})</h3>
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
        )
      )}

      {/* ============================================================
          3. STUDENT RESULT PORTAL VIEW (LIGHT THEME)
         ============================================================ */}
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

      {/* ============================================================
          MODALS
         ============================================================ */}

      {/* CENTER REGISTRATION MODAL */}
      {showCenterRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowCenterRegisterModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0d2149' }}>Register Examination Center</h3>
              <button className="modal-close-btn" onClick={() => setShowCenterRegisterModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleRegisterCenterSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Center Name *</label>
                  <input 
                    placeholder="e.g. DSVV BILASPUR REGIONAL CENTER" 
                    value={newCenterForm.centerName} 
                    onChange={e => setNewCenterForm(p => ({ ...p, centerName: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Desired Center ID / Code *</label>
                  <input 
                    placeholder="e.g. DSVV-CTR-02" 
                    value={newCenterForm.centerCode} 
                    onChange={e => setNewCenterForm(p => ({ ...p, centerCode: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Coordinator Name</label>
                  <input 
                    placeholder="e.g. DR. R.K. VERMA" 
                    value={newCenterForm.coordinatorName} 
                    onChange={e => setNewCenterForm(p => ({ ...p, coordinatorName: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email"
                    placeholder="center@devsanskritivishwavidyalaya.com" 
                    value={newCenterForm.email} 
                    onChange={e => setNewCenterForm(p => ({ ...p, email: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    placeholder="+91-XXXXXXXXXX" 
                    value={newCenterForm.phone} 
                    onChange={e => setNewCenterForm(p => ({ ...p, phone: e.target.value }))} 
                  />
                </div>
                <div className="form-group">
                  <label>Create Login Password *</label>
                  <input 
                    type="password"
                    placeholder="Enter secure password" 
                    value={newCenterForm.password} 
                    onChange={e => setNewCenterForm(p => ({ ...p, password: e.target.value }))} 
                    required 
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCenterRegisterModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Submit Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
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
