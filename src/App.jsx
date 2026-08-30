import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, UserPlus, UploadCloud, FileText, Calendar, 
  Edit3, Trash2, Globe, Sliders, CheckCircle, Eye, 
  Printer, ArrowLeft, User, Image, BookOpen, 
  RefreshCw, X, AlertCircle, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

// Import Templates
import MarksheetTemplate from './components/MarksheetTemplate';
import AdmitCardTemplate from './components/AdmitCardTemplate';
import IdCardTemplate from './components/IdCardTemplate';
import OnlineResultTemplate from './components/OnlineResultTemplate';
import ImageCropper from './components/ImageCropper';

export default function App() {
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('dsvv_auth_token') || '');
  const [loginPortal, setLoginPortal] = useState('admin'); // 'admin' or 'center'
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation View: 'admin' or 'portal'
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'portal') return 'portal';
    return 'admin';
  };
  const [currentView, setCurrentView] = useState(getInitialView());
  
  // Database States
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Tab: 'dashboard', 'add-student', 'courses'
  const [adminTab, setAdminTab] = useState('dashboard');
  
  // Dashboard Search & Filters
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSession, setSearchSession] = useState('');

  // Form States (New/Edit Student)
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    courseName: '',
    session: '',
    photo: '',
  });
  const [selectedTerm, setSelectedTerm] = useState(''); // e.g. "1st Semester"
  const [formMarksheets, setFormMarksheets] = useState({}); // { termName: { subjectCode: obtainedMarks } }
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isCompleteEdit, setIsCompleteEdit] = useState(false);

  // Photo cropping states
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);

  // Course Upload CSV state
  const [csvFile, setCsvFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState('');

  // Document Modal View State
  const [activeDocStudent, setActiveDocStudent] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('marksheet'); // 'marksheet', 'admit', 'id', 'result'
  const [activeDocTerm, setActiveDocTerm] = useState('');

  // Portal Public Search States
  const [portalName, setPortalName] = useState('');
  const [portalSearchVal, setPortalSearchVal] = useState('');
  const [portalStudent, setPortalStudent] = useState(null);
  const [portalCourse, setPortalCourse] = useState(null);
  const [portalError, setPortalError] = useState('');
  const [portalActiveTab, setPortalActiveTab] = useState('marksheet');
  const [portalActiveTerm, setPortalActiveTerm] = useState('');
  
  // Selective Publishing States
  const [publishingStudent, setPublishingStudent] = useState(null);
  const [localPublishDocs, setLocalPublishDocs] = useState({
    idCard: false,
    marksheets: {},
    admitCards: {},
    results: {}
  });

  // Load database on mount
  useEffect(() => {
    if (authToken) {
      verifyToken();
    }
  }, []);

  // Verify existing token
  const verifyToken = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        fetchData();
      } else {
        localStorage.removeItem('dsvv_auth_token');
        setAuthToken('');
      }
    } catch (e) {
      localStorage.removeItem('dsvv_auth_token');
      setAuthToken('');
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          portal: loginPortal
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setLoginError(data.error || 'Login failed');
        setLoginLoading(false);
        return;
      }
      
      localStorage.setItem('dsvv_auth_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      setLoginUsername('');
      setLoginPassword('');
      fetchData();
    } catch (err) {
      setLoginError('Unable to connect to server');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (e) {}
    
    localStorage.removeItem('dsvv_auth_token');
    setAuthToken('');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Load database on mount

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Failed to load database.');
      const data = await res.json();
      setCourses(data.courses || []);
      setStudents(data.students || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not connect to backend server. Make sure node server.js is running.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to register view or edit view
  const startRegisterStudent = () => {
    setEditingStudentId(null);
    setIsCompleteEdit(false);
    setFormData({
      name: '',
      fatherName: '',
      motherName: '',
      dob: '',
      courseName: courses.length > 0 ? courses[0].name : '',
      session: '',
      photo: '',
    });
    setSelectedTerm('');
    setFormMarksheets({});
    setAdminTab('add-student');
  };

  const startEditStudent = (student, complete) => {
    setEditingStudentId(student.id);
    setIsCompleteEdit(complete);
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      motherName: student.motherName,
      dob: student.dob,
      courseName: student.course,
      session: student.session,
      photo: student.photo,
    });
    
    // Choose the first marksheet term as selected
    const terms = Object.keys(student.marksheets);
    const initialTerm = terms.includes(selectedTerm) ? selectedTerm : (terms[0] || '');
    setSelectedTerm(initialTerm);
    
    // Gather all existing term marks into formMarksheets
    const initialMarks = {};
    Object.keys(student.marksheets).forEach(t => {
      initialMarks[t] = student.marksheets[t].marks || {};
    });
    setFormMarksheets(initialMarks);
    
    setAdminTab('add-student');
  };

  // Handle Photo selection
  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload photo to backend
  const handleCropComplete = async (croppedBase64) => {
    setCropSrc(null); // Close cropper modal
    try {
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: croppedBase64,
          ext: '.png'
        })
      });
      const data = await response.json();
      if (data.photoUrl) {
        setFormData(prev => ({ ...prev, photo: data.photoUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload cropped photo');
    }
  };

  // Form Course Change => reset Term and Marks table
  useEffect(() => {
    if (formData.courseName && courses.length > 0) {
      const selectedCourse = courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase());
      if (selectedCourse) {
        const terms = Object.keys(selectedCourse.terms);
        if (terms.length > 0) {
          setSelectedTerm(terms[0]);
        }
      }
    }
  }, [formData.courseName, courses]);

  // Handle Marks input change targeting specific active selectedTerm
  const handleMarkChange = (subCode, val, maxMarks) => {
    const numericVal = val === '' ? '' : Math.min(maxMarks, Math.max(0, parseInt(val) || 0));
    setFormMarksheets(prev => ({
      ...prev,
      [selectedTerm]: {
        ...(prev[selectedTerm] || {}),
        [subCode]: numericVal
      }
    }));
  };

  // Submit Student Registration/Update
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob || !formData.courseName || !formData.session) {
      alert('Please fill in all student credentials.');
      return;
    }

    try {
      // Assemble marksheet data structure for all terms in formMarksheets
      const marksheetsData = {};
      Object.keys(formMarksheets).forEach(termName => {
        marksheetsData[termName] = {
          marks: formMarksheets[termName] || {}
        };
      });

      let url = '/api/students';
      let method = 'POST';
      let bodyData = {
        ...formData,
        marksheetsData
      };

      if (editingStudentId) {
        url = `/api/students/${editingStudentId}`;
        method = 'PUT';
        bodyData = {
          ...formData,
          marksheetsData,
          isCompleteEdit,
          id: editingStudentId
        };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const resJson = await response.json();
      if (!response.ok) {
        alert(resJson.error || 'Failed to save student record');
        return;
      }

      // Success
      await fetchData();
      setAdminTab('dashboard');
      
      // Fire confetti for new student creation!
      if (!editingStudentId) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  };

  // Delete student
  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student record? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        alert('Failed to delete student');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open publish config dialog
  const startPublishDocs = (student) => {
    setPublishingStudent(student);
    setLocalPublishDocs(student.publishedDocs || {
      idCard: false,
      marksheets: {},
      admitCards: {},
      results: {}
    });
  };

  // Submit selective publishing settings to server
  const submitPublishSettings = async () => {
    try {
      const res = await fetch(`/api/students/${publishingStudent.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedDocs: localPublishDocs })
      });
      if (res.ok) {
        await fetchData();
        setPublishingStudent(null);
        // Celebration!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      } else {
        alert('Failed to update publishing settings.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to server.');
    }
  };

  // CSV Course upload
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvMessage('Please select a CSV file first.');
      return;
    }

    const form = new FormData();
    form.append('csvFile', csvFile);

    setCsvMessage('Uploading and parsing CSV...');
    try {
      const res = await fetch('/api/courses/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        setCsvMessage('CSV uploaded successfully!');
        setCourses(data.courses || []);
        setCsvFile(null);
        await fetchData();
      } else {
        setCsvMessage(data.error || 'Failed to parse CSV');
      }
    } catch (err) {
      console.error(err);
      setCsvMessage('Error uploading file.');
    }
  };

  // Document modal viewer triggers
  const openDocsModal = (student) => {
    setActiveDocStudent(student);
    setActiveDocTab('marksheet');
    const terms = Object.keys(student.marksheets);
    setActiveDocTerm(terms[0] || '');
  };

  // Public portal search lookup
  const handlePortalSearch = async (e) => {
    e.preventDefault();
    setPortalError('');
    setPortalStudent(null);
    setPortalCourse(null);

    if (!portalName || !portalSearchVal) {
      setPortalError('Both student name and roll/enrollment number are required.');
      return;
    }

    try {
      const res = await fetch(`/api/public/student?name=${encodeURIComponent(portalName)}&searchVal=${encodeURIComponent(portalSearchVal)}`);
      const data = await res.json();
      
      if (!res.ok) {
        setPortalError(data.error || 'Student not found.');
        return;
      }
      
      setPortalStudent(data.student);
      setPortalCourse(data.course);
      
      const terms = Object.keys(data.student.marksheets);
      const docs = data.student.publishedDocs || {};
      
      // Find the first term that has at least one document published
      const firstPublishedTerm = terms.find(t => {
        const showM = docs.marksheets && docs.marksheets[t];
        const showA = docs.admitCards && docs.admitCards[t];
        const showR = docs.results && docs.results[t];
        return showM || showA || showR;
      }) || '';
      
      setPortalActiveTerm(firstPublishedTerm);
      
      // Determine default active tab based on what's actually published
      let defaultTab = 'marksheet';
      if (firstPublishedTerm) {
        if (docs.marksheets && docs.marksheets[firstPublishedTerm]) defaultTab = 'marksheet';
        else if (docs.admitCards && docs.admitCards[firstPublishedTerm]) defaultTab = 'admit';
        else if (docs.results && docs.results[firstPublishedTerm]) defaultTab = 'result';
      } else if (docs.idCard) {
        defaultTab = 'id';
      }
      setPortalActiveTab(defaultTab);
    } catch (err) {
      console.error(err);
      setPortalError('Unable to connect to database. Please check back later.');
    }
  };

  // Trigger print in browser
  const triggerPrint = () => {
    window.print();
  };

  // Download current document as JPG
  const downloadAsImage = async (filename = 'document') => {
    try {
      // Find the document element to capture - try multiple selectors
      const selectors = [
        '.portal-doc-preview-panel .preview-scroll-wrapper > div',
        '.modal-document-frame > div',
        '.portal-docs-workspace .preview-scroll-wrapper > div',
        '.portal-doc-preview-panel > div',
        '.portal-doc-preview-panel',
      ];
      
      let docElement = null;
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerHTML.trim().length > 0) {
          docElement = el;
          break;
        }
      }
      
      if (!docElement) {
        alert('No document found to capture. Please select a document tab first.');
        return;
      }

      const canvas = await html2canvas(docElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: docElement.scrollWidth,
        height: docElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure cloned element has proper sizing
          const clonedEl = clonedDoc.querySelector('.portal-doc-preview-panel') ||
                          clonedDoc.querySelector('.modal-document-frame');
          if (clonedEl) {
            clonedEl.style.overflow = 'visible';
            clonedEl.style.height = 'auto';
          }
        }
      });

      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Image generation failed:', err);
      alert('Image generation failed. Use Print > Save as PDF as an alternative.');
    }
  };

  // Filter students based on search input
  const filteredStudents = students.filter(student => {
    const matchCourse = searchCourse ? student.course.toLowerCase().includes(searchCourse.toLowerCase()) : true;
    const matchSession = searchSession ? student.session.toLowerCase().includes(searchSession.toLowerCase()) : true;
    return matchCourse && matchSession;
  });

  // If not logged in, show login page
  if (!isLoggedIn) {
    return (
      <div className="login-page-container">
        <div className="login-card glass-panel">
          <div className="login-header">
            <img src="/DSVV-Logo.png" alt="DSVV Logo" className="login-logo" />
            <h1>DEV SANSKRITI VISHWAVIDYALAYA</h1>
            <p>DURG, CHHATTISGARH</p>
          </div>
          
          <div className="portal-selector">
            <button 
              className={`portal-btn ${loginPortal === 'admin' ? 'active' : ''}`}
              onClick={() => { setLoginPortal('admin'); setLoginError(''); }}
            >
              <Sliders size={18} /> Admin Portal
            </button>
            <button 
              className={`portal-btn ${loginPortal === 'center' ? 'active' : ''}`}
              onClick={() => { setLoginPortal('center'); setLoginError(''); }}
            >
              <Globe size={18} /> Center Portal
            </button>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div>
              <label className="form-label">Username</label>
              <input 
                type="text" 
                required 
                className="form-input"
                placeholder="Enter username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                required 
                className="form-input"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            
            {loginError && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary login-submit" disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="login-footer">
            <a href="https://dev-sanskriti-vishwavidhlaya.onrender.com" target="_blank" className="back-to-website-link">
              <Globe size={14} /> Back to Main Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root-container">
      
      {/* ----------------- Top Navigation Bar (Screen Only) ----------------- */}
      <header className="admin-header no-print">
        <div className="logo-section">
          <img src="/DSVV-Logo.png" alt="DSVV Logo" className="logo-monogram-top" />
          <div>
            <h1 className="header-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
            <p className="header-univ-sub">DURG, CHHATTISGARH &bull; {currentUser?.role === 'admin' ? 'ADMIN PANEL' : 'CENTER PANEL'}</p>
          </div>
        </div>

        <nav className="header-nav">
          {currentUser?.role === 'admin' && (
            <>
              <button 
                className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => { setCurrentView('admin'); fetchData(); }}
              >
                <Sliders size={18} /> Desktop App
              </button>
              <button 
                className={`nav-mode-btn ${currentView === 'portal' ? 'active' : ''}`}
                onClick={() => { setCurrentView('portal'); setPortalStudent(null); setPortalError(''); }}
              >
                <Globe size={18} /> Web Portal
              </button>
            </>
          )}
          {currentUser?.role === 'center' && (
            <button 
              className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => { setCurrentView('admin'); fetchData(); }}
            >
              <Eye size={18} /> Dashboard
            </button>
          )}
          <div className="user-info-section">
            <User size={16} />
            <span className="user-name">{currentUser?.name}</span>
            <span className={`user-role-badge ${currentUser?.role}`}>{currentUser?.role}</span>
          </div>
          <button className="nav-mode-btn logout-btn" onClick={handleLogout}>
            <X size={18} /> Logout
          </button>
        </nav>
      </header>

      {/* Main Content Layout */}
      <main className="main-layout-container">
        
        {/* -------------------------------------------------------------
           1. ADMIN DASHBOARD VIEW (Desktop App look)
           ------------------------------------------------------------- */}
        {currentView === 'admin' && (
          <div className="admin-view-wrapper no-print animate-fade-in">
            {/* Sidebar for Desktop Dashboard */}
            <aside className="dashboard-sidebar">
              <div className="sidebar-heading">NAVIGATOR</div>
              <button 
                className={`sidebar-link ${adminTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setAdminTab('dashboard')}
              >
                <Eye size={18} /> Dashboard List
              </button>
              {currentUser?.role === 'admin' && (
                <>
                  <button 
                    className={`sidebar-link ${adminTab === 'add-student' ? 'active' : ''}`}
                    onClick={startRegisterStudent}
                  >
                    <UserPlus size={18} /> Add Student
                  </button>
                  <button 
                    className={`sidebar-link ${adminTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setAdminTab('courses')}
                  >
                    <BookOpen size={18} /> Course Manager
                  </button>
                </>
              )}
              
              <div className="sidebar-footer-info">
                <RefreshCw size={14} className="spin-icon" onClick={fetchData} style={{ cursor: 'pointer' }} />
                <span>DB status: Connected</span>
              </div>
            </aside>

            {/* Admin Content Panel */}
            <section className="admin-content-panel">
              {errorMsg && (
                <div className="error-banner">
                  <AlertCircle size={20} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* A. DASHBOARD STUDENT LIST */}
              {adminTab === 'dashboard' && (
                <div className="tab-content-wrapper">
                  <div className="page-header-row">
                    <h2>Student Records Dashboard</h2>
                    <button className="btn btn-primary" onClick={startRegisterStudent}>
                      <UserPlus size={16} /> Register Student
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="glass-panel search-filter-bar" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by Course..." 
                        className="form-input" 
                        style={{ paddingLeft: '40px' }}
                        value={searchCourse}
                        onChange={(e) => setSearchCourse(e.target.value)}
                      />
                    </div>
                    <div style={{ width: '250px' }}>
                      <input 
                        type="text" 
                        placeholder="Filter by Session..." 
                        className="form-input"
                        value={searchSession}
                        onChange={(e) => setSearchSession(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Student Grid */}
                  {loading ? (
                    <div className="loading-state">Loading students...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <User size={48} style={{ color: 'var(--text-muted)' }} />
                      <p>No student records found matching the criteria.</p>
                    </div>
                  ) : (
                    <div className="student-grid">
                      {filteredStudents.map(student => (
                        <div key={student.id} className="student-card glass-panel glass-panel-interactive">
                          <div className="student-card-header">
                            <div className="photo-container">
                              {student.photo ? (
                                <img src={student.photo} alt={student.name} />
                              ) : (
                                <User size={32} style={{ color: 'var(--text-muted)' }} />
                              )}
                            </div>
                            <div className="student-header-text">
                              <h3>{student.name}</h3>
                              <p className="student-session-badge">{student.session}</p>
                            </div>
                          </div>

                          <div className="student-card-details">
                            <div className="detail-row">
                              <span className="lbl">Roll No:</span>
                              <span className="val">{student.rollNo}</span>
                            </div>
                            <div className="detail-row">
                              <span className="lbl">Enroll No:</span>
                              <span className="val">{student.enrollmentNo}</span>
                            </div>
                            <div className="detail-row">
                              <span className="lbl">Course:</span>
                              <span className="val text-truncate">{student.course}</span>
                            </div>
                            <div className="detail-row" style={{ marginTop: '8px' }}>
                              <span className="lbl">Status:</span>
                              <span className={`status-badge ${student.isPublished ? 'published' : 'draft'}`}>
                                {student.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>

                          <div className="student-card-actions">
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => openDocsModal(student)}
                              title="View and Print Documents"
                            >
                              <Printer size={14} /> View
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => startEditStudent(student, false)}
                              title="Partial Edit: Student Details & Marks"
                            >
                              <Edit3 size={14} /> Partial
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => startEditStudent(student, true)}
                              title="Complete Edit: Change Course / Session Structure"
                            >
                              <Sliders size={14} /> Complete
                            </button>
                            
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => startPublishDocs(student)}
                              title="Configure publishing settings for Student Web Portal"
                            >
                              <CheckCircle size={14} /> Publish
                            </button>
                            {student.isPublished && (
                              <span className="published-check" title="Documents are Live on Web Portal">
                                <CheckCircle size={14} color="var(--secondary)" /> Live
                              </span>
                            )}
                            
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeleteStudent(student.id)}
                              title="Delete Record"
                              style={{ marginLeft: 'auto', padding: '8px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* B. ADD / EDIT STUDENT FORM */}
              {adminTab === 'add-student' && (
                <div className="tab-content-wrapper glass-panel" style={{ padding: '30px' }}>
                  <div className="form-header">
                    <h2>{editingStudentId ? (isCompleteEdit ? 'Complete Structure Edit' : 'Partial Student Edit') : 'Register New Student'}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {editingStudentId ? `Modifying profile for Roll No: ${students.find(s => s.id === editingStudentId)?.rollNo}` : 'Sequential Roll/Enrollment numbering will auto-apply.'}
                    </p>
                  </div>

                  <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-row-grid">
                      <div>
                        <label className="form-label">Student Name</label>
                        <input 
                          type="text" 
                          required 
                          className="form-input"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Father's Name</label>
                        <input 
                          type="text" 
                          required 
                          className="form-input"
                          value={formData.fatherName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Mother's Name</label>
                        <input 
                          type="text" 
                          required 
                          className="form-input"
                          value={formData.motherName}
                          onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value.toUpperCase() }))}
                        />
                      </div>
                    </div>

                    <div className="form-row-grid">
                      <div>
                        <label className="form-label">Date of Birth (DD/MM/YYYY)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="DD/MM/YYYY"
                          maxLength={10}
                          className="form-input"
                          value={formData.dob}
                          onChange={(e) => {
                            const val = e.target.value;
                            const clean = val.replace(/\D/g, '');
                            const digits = clean.slice(0, 8);
                            
                            let formatted = '';
                            if (digits.length <= 2) {
                              formatted = digits;
                            } else if (digits.length <= 4) {
                              formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                            } else {
                              formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                            }
                            setFormData(prev => ({ ...prev, dob: formatted }));
                          }}
                        />
                      </div>

                      <div>
                        <label className="form-label">Course</label>
                        {editingStudentId && !isCompleteEdit ? (
                          <input 
                            type="text" 
                            disabled 
                            className="form-input" 
                            style={{ opacity: 0.6 }}
                            value={formData.courseName}
                          />
                        ) : (
                          <select 
                            className="form-select"
                            value={formData.courseName}
                            onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                          >
                            {courses.length === 0 ? (
                              <option value="">No courses parsed. Upload CSV first.</option>
                            ) : (
                              courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
                            )}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Session (Final End Year)</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. 2026 FINAL or 2024-2026"
                          className="form-input"
                          disabled={editingStudentId && !isCompleteEdit}
                          style={{ opacity: editingStudentId && !isCompleteEdit ? 0.6 : 1 }}
                          value={formData.session}
                          onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value.toUpperCase() }))}
                        />
                      </div>
                    </div>

                    {/* Photo upload row */}
                    <div className="photo-upload-row">
                      <div className="photo-preview-box">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Cropped preview" />
                        ) : (
                          <div className="placeholder"><Image size={32} /></div>
                        )}
                      </div>
                      <div>
                        <label className="form-label">Upload Student Photo (Free Crop)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="form-input" 
                          onChange={handlePhotoSelect} 
                        />
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>
                          Upload an image and crop it using our built-in precision cropping tool.
                        </p>
                      </div>
                    </div>

                    {/* Subject Marks section */}
                    {formData.courseName && (
                      <div className="form-marks-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 className="form-label" style={{ fontSize: '14px', margin: 0 }}>Subject Marks Entry</h3>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="form-label" style={{ margin: 0, textTransform: 'none' }}>Select Semester/Year:</span>
                            <select 
                              className="form-select"
                              style={{ width: '180px', padding: '6px 12px' }}
                              value={selectedTerm}
                              onChange={(e) => setSelectedTerm(e.target.value)}
                            >
                              {courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase()) ? (
                                Object.keys(courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase()).terms).map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))
                              ) : (
                                <option value="">Select Course</option>
                              )}
                            </select>
                          </div>
                        </div>

                        {/* Auto-generate Marks block */}
                        <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="form-label" style={{ margin: 0, textTransform: 'none' }}>Target Percentage:</span>
                            <input 
                              type="number"
                              min={35}
                              max={100}
                              placeholder="e.g. 75"
                              className="form-input"
                              style={{ width: '100px', padding: '6px 10px' }}
                              id="target-percentage-input"
                            />
                            <span>%</span>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            style={{ margin: 0 }}
                            onClick={() => {
                              const pctInput = document.getElementById('target-percentage-input');
                              const pctVal = parseInt(pctInput ? pctInput.value : '');
                              if (isNaN(pctVal) || pctVal < 35 || pctVal > 100) {
                                alert('Please enter a target percentage between 35 and 100.');
                                return;
                              }
                              
                              const course = courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase());
                              if (!course || !selectedTerm || !course.terms[selectedTerm]) return;
                              
                              const activeSubjects = course.terms[selectedTerm];
                              const totalMaxMarks = activeSubjects.reduce((sum, s) => sum + (parseInt(s.maxMarks) || 100), 0);
                              const targetTotal = Math.round(totalMaxMarks * (pctVal / 100));
                              
                              // Determine limits: default [40, 80] (above 40, less than 80)
                              let lowBound = 40;
                              let highBound = 80;
                              
                              // If target percentage is outside [40, 80], dynamically shift boundaries
                              if (pctVal < 40) {
                                lowBound = Math.max(0, pctVal - 10);
                                highBound = Math.min(100, pctVal + 15);
                              } else if (pctVal > 80) {
                                lowBound = Math.max(0, pctVal - 15);
                                highBound = Math.min(100, pctVal + 10);
                              }
                              
                              // Baseline random assignment within bounds scaled to subject maxMarks
                              const generated = {};
                              let currentSum = 0;
                              
                              activeSubjects.forEach(sub => {
                                const maxM = parseInt(sub.maxMarks) || 100;
                                const factor = maxM / 100;
                                
                                const subLow = Math.round(lowBound * factor);
                                const subHigh = Math.round(highBound * factor);
                                
                                const randomVal = Math.floor(Math.random() * (subHigh - subLow + 1)) + subLow;
                                generated[sub.code] = randomVal;
                                currentSum += randomVal;
                              });
                              
                              // Randomly adjust the difference to sum up to exactly targetTotal
                              let diff = targetTotal - currentSum;
                              let attempts = 0;
                              const maxAttempts = 1000;
                              
                              while (diff !== 0 && attempts < maxAttempts) {
                                attempts++;
                                // Shuffle indices to distribute increments/decrements naturally
                                const indices = Array.from({ length: activeSubjects.length }, (_, i) => i);
                                indices.sort(() => Math.random() - 0.5);
                                
                                for (let idx of indices) {
                                  if (diff === 0) break;
                                  
                                  const sub = activeSubjects[idx];
                                  const maxM = parseInt(sub.maxMarks) || 100;
                                  const factor = maxM / 100;
                                  const subLow = Math.round(lowBound * factor);
                                  const subHigh = Math.round(highBound * factor);
                                  
                                  let currentVal = generated[sub.code];
                                  if (diff > 0 && currentVal < subHigh) {
                                    generated[sub.code] += 1;
                                    diff -= 1;
                                  } else if (diff < 0 && currentVal > subLow) {
                                    generated[sub.code] -= 1;
                                    diff += 1;
                                  }
                                }
                              }
                              
                              setFormMarksheets(prev => ({
                                ...prev,
                                [selectedTerm]: generated
                              }));
                            }}
                          >
                            Generate Marks
                          </button>
                        </div>

                        {/* Subject Input Fields */}
                        <div className="marks-input-container">
                          {courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase())?.terms[selectedTerm] ? (
                            <table className="marks-input-table">
                              <thead>
                                <tr>
                                  <th>Code</th>
                                  <th style={{ textAlign: 'left' }}>Subject</th>
                                  <th>Min Marks</th>
                                  <th>Max Marks</th>
                                  <th style={{ width: '150px' }}>Obtained Marks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase()).terms[selectedTerm].map(sub => (
                                  <tr key={sub.code}>
                                    <td style={{ textAlign: 'center' }}>{sub.code}</td>
                                    <td>{sub.name}</td>
                                    <td style={{ textAlign: 'center' }}>{sub.minMarks}</td>
                                    <td style={{ textAlign: 'center' }}>{sub.maxMarks}</td>
                                    <td>
                                      <input 
                                        type="number"
                                        min={0}
                                        max={sub.maxMarks}
                                        placeholder={`Max ${sub.maxMarks}`}
                                        className="form-input text-center"
                                        style={{ padding: '6px' }}
                                        value={formMarksheets[selectedTerm]?.[sub.code] !== undefined ? formMarksheets[selectedTerm][sub.code] : ''}
                                        onChange={(e) => handleMarkChange(sub.code, e.target.value, sub.maxMarks)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="loading-state">No subjects configured for selected term. Check CSV upload.</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" className="btn btn-outline" onClick={() => setAdminTab('dashboard')}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingStudentId ? 'Update Record' : 'Save & Register Student'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* C. MANAGE COURSES (CSV UPLOADS) */}
              {adminTab === 'courses' && (
                <div className="tab-content-wrapper animate-fade-in">
                  <h2>Course CSV Manager</h2>
                  
                  <div className="csv-uploader-row">
                    {/* Upload card */}
                    <div className="glass-panel csv-upload-card">
                      <h3 className="form-label" style={{ marginBottom: '12px' }}>Upload Course Mapping</h3>
                      <form onSubmit={handleCsvUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="upload-dropzone">
                          <UploadCloud size={40} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                          <span>Select Course CSV File</span>
                          <input 
                            type="file" 
                            accept=".csv" 
                            required 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setCsvFile(e.target.files[0]);
                                setCsvMessage('');
                              }
                            }} 
                          />
                        </div>
                        {csvFile && <div className="file-info">Selected file: <strong>{csvFile.name}</strong></div>}
                        
                        <button type="submit" className="btn btn-primary">
                          <UploadCloud size={16} /> Process CSV Mapping
                        </button>
                        
                        {csvMessage && (
                          <div className={`message-banner ${csvMessage.includes('success') ? 'success' : 'info'}`}>
                            {csvMessage}
                          </div>
                        )}
                      </form>
                    </div>

                    {/* Configured Courses List */}
                    <div className="glass-panel courses-list-card">
                      <h3 className="form-label" style={{ marginBottom: '12px' }}>Configured Courses ({courses.length})</h3>
                      <div className="courses-list-scrollbar">
                        {courses.length === 0 ? (
                          <div className="empty-state" style={{ padding: '20px' }}>No courses uploaded yet. Use the uploader to import CSVs.</div>
                        ) : (
                          courses.map(c => (
                            <div key={c.name} className="course-item-row">
                              <div style={{ flex: 1 }}>
                                <strong>{c.name}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  Type: <span style={{ textTransform: 'capitalize' }}>{c.type}</span>
                                </div>
                                <div className="terms-badges-row" style={{ marginTop: '6px' }}>
                                  {Object.keys(c.terms).map(term => (
                                    <span key={term} className="term-badge">
                                      {term}: {c.terms[term].length} Subjects
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                className="btn btn-danger btn-sm"
                                style={{ padding: '6px 10px', fontSize: '11px', flexShrink: 0 }}
                                onClick={async () => {
                                  if (!confirm(`Delete course "${c.name}"? This cannot be undone.`)) return;
                                  try {
                                    const res = await fetch(`/api/courses/${encodeURIComponent(c.name)}`, { method: 'DELETE' });
                                    if (res.ok) {
                                      await fetchData();
                                    } else {
                                      const data = await res.json();
                                      alert(data.error || 'Failed to delete course');
                                    }
                                  } catch (err) {
                                    alert('Error connecting to server');
                                  }
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* -------------------------------------------------------------
           2. PUBLIC WEBSITE PORTAL (Student lookup and document view)
           ------------------------------------------------------------- */}
        {currentView === 'portal' && (
          <div className="portal-view-wrapper no-print animate-fade-in">
            {/* If student is not logged in / lookup not performed */}
            {!portalStudent ? (
              <div className="portal-landing-container">
                <div className="glass-panel portal-search-card">
                  <div className="portal-header-decor">
                    <img src="/DSVV-Logo.png" alt="DSVV Logo" className="portal-logo" />
                    <h2>DEV SANSKRITI VISHWAVIDYALAYA</h2>
                    <p>STUDENT ONLINE DOCUMENT VERIFICATION HUB</p>
                  </div>
                  
                  <form onSubmit={handlePortalSearch} className="portal-search-form">
                    <div>
                      <label className="form-label" style={{ color: '#fff' }}>Student Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter your name as registered"
                        className="form-input portal-input"
                        value={portalName}
                        onChange={(e) => setPortalName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: '#fff' }}>Roll Number or Enrollment Number</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter 6-digit Roll No. or 10-digit Enrollment No."
                        className="form-input portal-input"
                        value={portalSearchVal}
                        onChange={(e) => setPortalSearchVal(e.target.value)}
                      />
                    </div>
                    
                    <button type="submit" className="btn btn-primary portal-btn" style={{ marginTop: '10px' }}>
                      <Globe size={18} /> Search & Retrieve Documents
                    </button>
                  </form>

                  {portalError && (
                    <div className="portal-error-banner">
                      <AlertCircle size={18} />
                      <span>{portalError}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Student Profile and Issued Documents Portal View */
              <div className="portal-student-hub">
                {/* Hub Header */}
                <div className="glass-panel hub-header-card">
                  <button className="btn btn-outline btn-sm" onClick={() => setPortalStudent(null)}>
                    <ArrowLeft size={16} /> Back to Search
                  </button>
                  
                  <div className="hub-student-header-info">
                    <div className="photo-container-large">
                      {portalStudent.photo ? (
                        <img src={portalStudent.photo} alt={portalStudent.name} />
                      ) : (
                        <User size={48} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div>
                      <h2>Welcome, {portalStudent.name.toUpperCase()}</h2>
                      <div className="hub-metadata-grid">
                        <span><strong>Course:</strong> {portalStudent.course}</span>
                        <span><strong>Roll No:</strong> {portalStudent.rollNo}</span>
                        <span><strong>Enrollment No:</strong> {portalStudent.enrollmentNo}</span>
                        <span><strong>Session:</strong> {portalStudent.session}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab layout for documents */}
                <div className="portal-docs-workspace">
                  {/* Selector sidebar */}
                  <div className="portal-docs-sidebar">
                    {/* Term Selector */}
                    <div className="term-selector-block glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Academic Term</label>
                      <select 
                        className="form-select"
                        value={portalActiveTerm}
                        onChange={(e) => setPortalActiveTerm(e.target.value)}
                      >
                        {Object.keys(portalStudent.marksheets)
                          .filter(t => {
                            const docs = portalStudent.publishedDocs || {};
                            const m = docs.marksheets && docs.marksheets[t];
                            const a = docs.admitCards && docs.admitCards[t];
                            const r = docs.results && docs.results[t];
                            return m || a || r;
                          })
                          .map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        }
                      </select>
                    </div>

                    <div className="doc-tabs-menu glass-panel">
                      {portalStudent.publishedDocs?.marksheets?.[portalActiveTerm] && (
                        <button 
                          className={`doc-tab-link ${portalActiveTab === 'marksheet' ? 'active' : ''}`}
                          onClick={() => setPortalActiveTab('marksheet')}
                        >
                          <FileText size={18} /> Marksheet Statement
                        </button>
                      )}
                      {portalStudent.publishedDocs?.admitCards?.[portalActiveTerm] && (
                        <button 
                          className={`doc-tab-link ${portalActiveTab === 'admit' ? 'active' : ''}`}
                          onClick={() => setPortalActiveTab('admit')}
                        >
                          <Calendar size={18} /> Admit Card
                        </button>
                      )}
                      {portalStudent.publishedDocs?.idCard && (
                        <button 
                          className={`doc-tab-link ${portalActiveTab === 'id' ? 'active' : ''}`}
                          onClick={() => setPortalActiveTab('id')}
                        >
                          <User size={18} /> Student ID Card
                        </button>
                      )}
                      {portalStudent.publishedDocs?.results?.[portalActiveTerm] && (
                        <button 
                          className={`doc-tab-link ${portalActiveTab === 'result' ? 'active' : ''}`}
                          onClick={() => setPortalActiveTab('result')}
                        >
                          <Globe size={18} /> Online Result Page
                        </button>
                      )}
                    </div>
                    
                    <button className="btn btn-primary print-action-btn" onClick={triggerPrint}>
                      <Printer size={18} /> Print / Save as PDF
                    </button>
                    <button className="btn btn-secondary print-action-btn" onClick={() => downloadAsImage(`${portalStudent.name}-${portalActiveTab}-${portalActiveTerm}`)}>
                      <Download size={18} /> Download JPG
                    </button>
                  </div>

                  {/* Rendering Area */}
                  <div className="portal-doc-preview-panel glass-panel">
                    <div className="preview-scroll-wrapper">
                      {portalActiveTab === 'marksheet' && (
                        <MarksheetTemplate 
                          student={portalStudent} 
                          course={portalCourse} 
                          termName={portalActiveTerm} 
                        />
                      )}
                      {portalActiveTab === 'admit' && (
                        <AdmitCardTemplate 
                          student={portalStudent} 
                          course={portalCourse} 
                          termName={portalActiveTerm} 
                        />
                      )}
                      {portalActiveTab === 'id' && (
                        <IdCardTemplate student={portalStudent} />
                      )}
                      {portalActiveTab === 'result' && (
                        <OnlineResultTemplate 
                          student={portalStudent} 
                          course={portalCourse} 
                          termName={portalActiveTerm} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ----------------- ADMIN DOCUMENTS DIALOG MODAL (Screen Only) ----------------- */}
      {activeDocStudent && (
        <div className="dialog-modal-overlay no-print animate-fade-in">
          <div className="dialog-modal-container">
            <div className="dialog-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3>Document Portal: {activeDocStudent.name}</h3>
                
                <select 
                  className="form-select"
                  style={{ width: '180px', padding: '4px 8px', fontSize: '12px' }}
                  value={activeDocTerm}
                  onChange={(e) => setActiveDocTerm(e.target.value)}
                >
                  {Object.keys(activeDocStudent.marksheets).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={triggerPrint}>
                  <Printer size={14} /> Print / PDF
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => downloadAsImage(`${activeDocStudent.name}-${activeDocTab}-${activeDocTerm}`)}>
                  <Download size={14} /> JPG
                </button>
                <button className="btn btn-outline btn-sm" style={{ padding: '6px' }} onClick={() => setActiveDocStudent(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Selector Nav Tabs inside Modal */}
            <div className="modal-tab-nav">
              <button 
                className={`modal-nav-link ${activeDocTab === 'marksheet' ? 'active' : ''}`}
                onClick={() => setActiveDocTab('marksheet')}
              >
                Marksheet
              </button>
              <button 
                className={`modal-nav-link ${activeDocTab === 'admit' ? 'active' : ''}`}
                onClick={() => setActiveDocTab('admit')}
              >
                Admit Card
              </button>
              <button 
                className={`modal-nav-link ${activeDocTab === 'id' ? 'active' : ''}`}
                onClick={() => setActiveDocTab('id')}
              >
                ID Card
              </button>
              <button 
                className={`modal-nav-link ${activeDocTab === 'result' ? 'active' : ''}`}
                onClick={() => setActiveDocTab('result')}
              >
                Online Result
              </button>
            </div>

            {/* Document Render block inside Modal */}
            <div className="modal-document-frame">
              {activeDocTab === 'marksheet' && (
                <MarksheetTemplate 
                  student={activeDocStudent} 
                  course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
                  termName={activeDocTerm} 
                />
              )}
              {activeDocTab === 'admit' && (
                <AdmitCardTemplate 
                  student={activeDocStudent} 
                  course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
                  termName={activeDocTerm} 
                />
              )}
              {activeDocTab === 'id' && (
                <IdCardTemplate student={activeDocStudent} />
              )}
              {activeDocTab === 'result' && (
                <OnlineResultTemplate 
                  student={activeDocStudent} 
                  course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
                  termName={activeDocTerm} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SELECTIVE PUBLISH DIALOG MODAL (Screen Only) ----------------- */}
      {publishingStudent && (
        <div className="dialog-modal-overlay no-print animate-fade-in">
          <div className="dialog-modal-container" style={{ maxWidth: '520px', height: 'auto', maxHeight: '85vh' }}>
            <div className="dialog-header-bar">
              <h3>Publishing Options: {publishingStudent.name}</h3>
              <button className="btn btn-outline btn-sm" style={{ padding: '6px' }} onClick={() => setPublishingStudent(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Select which student documents should be visible and accessible on the student public web portal.
              </p>
              
              {/* ID Card Checkbox */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#fff' }}>Student ID Card</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valid across all academic sessions</div>
                </div>
                <input 
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  checked={!!localPublishDocs.idCard}
                  onChange={(e) => setLocalPublishDocs(prev => ({ ...prev, idCard: e.target.checked }))}
                />
              </div>
              
              {/* Academic Terms Document Checklist */}
              <div>
                <h4 className="form-label" style={{ marginBottom: '10px' }}>Select Documents by Academic Term</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.keys(publishingStudent.marksheets).map(term => (
                    <div key={term} className="glass-panel" style={{ padding: '16px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--secondary)', display: 'block', marginBottom: '12px' }}>
                        {term.toUpperCase()}
                      </strong>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
                          <span>Marksheet Statement</span>
                          <input 
                            type="checkbox"
                            style={{ width: '16px', height: '16px' }}
                            checked={!!localPublishDocs.marksheets?.[term]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setLocalPublishDocs(prev => ({
                                ...prev,
                                marksheets: { ...(prev.marksheets || {}), [term]: checked }
                              }));
                            }}
                          />
                        </label>
                        
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
                          <span>Examination Admit Card</span>
                          <input 
                            type="checkbox"
                            style={{ width: '16px', height: '16px' }}
                            checked={!!localPublishDocs.admitCards?.[term]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setLocalPublishDocs(prev => ({
                                ...prev,
                                admitCards: { ...(prev.admitCards || {}), [term]: checked }
                              }));
                            }}
                          />
                        </label>
                        
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
                          <span>Online Result Page</span>
                          <input 
                            type="checkbox"
                            style={{ width: '16px', height: '16px' }}
                            checked={!!localPublishDocs.results?.[term]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setLocalPublishDocs(prev => ({
                                ...prev,
                                results: { ...(prev.results || {}), [term]: checked }
                              }));
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', backgroundColor: '#1f2937', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setPublishingStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitPublishSettings}>Confirm & Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PHOTO CROPPER BOX MODAL (Screen Only) ----------------- */}
      {cropSrc && (
        <ImageCropper 
          imageSrc={cropSrc} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropSrc(null)} 
        />
      )}

      {/* -------------------------------------------------------------
         3. PRINT DISPLAY CONTAINER (Rendered only when printing)
         ------------------------------------------------------------- */}
      {currentView === 'portal' && portalStudent && (
        <div className="print-only-container">
          {portalActiveTab === 'marksheet' && (
            <MarksheetTemplate 
              student={portalStudent} 
              course={portalCourse} 
              termName={portalActiveTerm} 
            />
          )}
          {portalActiveTab === 'admit' && (
            <AdmitCardTemplate 
              student={portalStudent} 
              course={portalCourse} 
              termName={portalActiveTerm} 
            />
          )}
          {portalActiveTab === 'id' && (
            <IdCardTemplate student={portalStudent} />
          )}
          {portalActiveTab === 'result' && (
            <OnlineResultTemplate 
              student={portalStudent} 
              course={portalCourse} 
              termName={portalActiveTerm} 
            />
          )}
        </div>
      )}

      {activeDocStudent && (
        <div className="print-only-container">
          {activeDocTab === 'marksheet' && (
            <MarksheetTemplate 
              student={activeDocStudent} 
              course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
              termName={activeDocTerm} 
            />
          )}
          {activeDocTab === 'admit' && (
            <AdmitCardTemplate 
              student={activeDocStudent} 
              course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
              termName={activeDocTerm} 
            />
          )}
          {activeDocTab === 'id' && (
            <IdCardTemplate student={activeDocStudent} />
          )}
          {activeDocTab === 'result' && (
            <OnlineResultTemplate 
              student={activeDocStudent} 
              course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} 
              termName={activeDocTerm} 
            />
          )}
        </div>
      )}

    </div>
  );
}
