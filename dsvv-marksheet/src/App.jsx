import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, UploadCloud, FileText, Calendar,
  Edit3, Trash2, Globe, Sliders, CheckCircle, Eye,
  Printer, ArrowLeft, User, Image, BookOpen,
  RefreshCw, X, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MarksheetTemplate from './components/MarksheetTemplate';
import AdmitCardTemplate from './components/AdmitCardTemplate';
import OnlineResultTemplate from './components/OnlineResultTemplate';
import ImageCropper from './components/ImageCropper';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'admin';
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [portalName, setPortalName] = useState('');
  const [portalSearchVal, setPortalSearchVal] = useState('');
  const [portalStudent, setPortalStudent] = useState(null);
  const [portalCourse, setPortalCourse] = useState(null);
  const [portalError, setPortalError] = useState('');
  const [portalActiveTab, setPortalActiveTab] = useState('marksheet');
  const [portalActiveTerm, setPortalActiveTerm] = useState('');
  const [publishingStudent, setPublishingStudent] = useState(null);
  const [localPublishDocs, setLocalPublishDocs] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      setCourses(data.courses || []);
      setStudents(data.students || []);
    } catch {
      setErrorMsg('Cannot connect to backend. Make sure node server.js is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const getTermNames = (course) => course ? Object.keys(course.terms) : [];
  const getTermSubjects = (course, term) => (course && course.terms[term]) || [];

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
    setFormData({ name: student.name, fatherName: student.fatherName, motherName: student.motherName, dob: student.dob, courseName: student.course, session: student.session, photo: student.photo });
    const terms = Object.keys(student.marksheets || {});
    const initialMarks = {};
    terms.forEach(t => { initialMarks[t] = student.marksheets[t].marks || {}; });
    setFormMarksheets(initialMarks);
    setSelectedTerm(terms[0] || '');
    setAdminTab('add-student');
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob || !formData.courseName || !formData.session) {
      alert('Please fill all required fields.'); return;
    }
    try {
      const marksheetsData = {};
      Object.keys(formMarksheets).forEach(t => { marksheetsData[t] = { marks: formMarksheets[t] || {} }; });
      let url = '/api/students', method = 'POST';
      let body = { ...formData, marksheetsData };
      if (editingStudentId) {
        url = `/api/students/${editingStudentId}`; method = 'PUT';
        body = { ...formData, marksheetsData, isCompleteEdit };
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { alert(json.error || 'Failed to save'); return; }
      if (!editingStudentId) confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      await fetchData();
      setAdminTab('dashboard');
      resetForm();
    } catch { alert('Error connecting to backend.'); }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student?')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) { setCsvMessage('Select a CSV file first.'); return; }
    const form = new FormData();
    form.append('csvFile', csvFile);
    setCsvMessage('Uploading...');
    try {
      const res = await fetch('/api/courses/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok) { setCsvMessage('CSV uploaded successfully!'); setCourses(data.courses || []); setCsvFile(null); await fetchData(); }
      else setCsvMessage(data.error || 'Failed');
    } catch { setCsvMessage('Upload error.'); }
  };

  const handleMarkChange = (subCode, val, maxMarks) => {
    const num = val === '' ? '' : Math.min(maxMarks, Math.max(0, parseInt(val) || 0));
    setFormMarksheets(prev => ({ ...prev, [selectedTerm]: { ...(prev[selectedTerm] || {}), [subCode]: num } }));
  };

  const generateMarks = () => {
    const course = courses.find(c => c.name === formData.courseName);
    if (!course || !selectedTerm) return;
    const subjects = getTermSubjects(course, selectedTerm);
    const pct = parseInt(prompt('Target percentage (35-100):'));
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
    setPortalError(''); setPortalStudent(null); setPortalCourse(null);
    if (!portalName || !portalSearchVal) { setPortalError('Both name and roll/enrollment required.'); return; }
    try {
      const res = await fetch(`/api/public/student?name=${encodeURIComponent(portalName)}&searchVal=${encodeURIComponent(portalSearchVal)}`);
      const data = await res.json();
      if (!res.ok) { setPortalError(data.error || 'Not found.'); return; }
      setPortalStudent(data.student); setPortalCourse(data.course);
      const terms = Object.keys(data.student.marksheets);
      const docs = data.student.publishedDocs || {};
      const first = terms.find(t => docs.marksheets?.[t] || docs.admitCards?.[t] || docs.results?.[t]) || '';
      setPortalActiveTerm(first);
      setPortalActiveTab('marksheet');
    } catch { setPortalError('Cannot connect to server.'); }
  };

  const filteredStudents = students.filter(s => {
    const mc = searchCourse ? s.course?.toLowerCase().includes(searchCourse.toLowerCase()) : true;
    const ms = searchSession ? s.session?.toLowerCase().includes(searchSession.toLowerCase()) : true;
    return mc && ms;
  });

  return (
    <div className={`app-root-container no-print ${currentView === 'portal' ? 'portal-view' : 'admin-view'}`}>
      {errorMsg && (
        <div className="error-banner">
          <AlertCircle size={20} /><span>{errorMsg}</span>
          <button onClick={fetchData}><RefreshCw size={16} /> Retry</button>
        </div>
      )}

      <header className="admin-header">
        <img src="/Monogram.png" alt="DSVV" className="logo-monogram-top" />
        <div className="header-brand">
          <h1 className="header-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
          <p className="header-univ-sub">RAIPUR, CHHATTISGARH &bull; ADMINISTRATIVE SYSTEMS</p>
        </div>
        <nav className="header-nav-actions">
          <button className={`nav-mode-btn ${currentView === 'admin' ? 'active' : ''}`} onClick={() => { setCurrentView('admin'); fetchData(); }}>
            <Sliders size={18} /> Desktop App
          </button>
          <button className={`nav-mode-btn ${currentView === 'portal' ? 'active' : ''}`} onClick={() => { setCurrentView('portal'); setPortalStudent(null); setPortalError(''); }}>
            <Globe size={18} /> Web Portal
          </button>
        </nav>
      </header>

      {/* ADMIN PANEL */}
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
            <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button className="refresh-btn" onClick={fetchData} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
              <span>DB status: Connected</span>
            </div>
          </aside>

          <main className="admin-content-panel">
            {/* DASHBOARD */}
            {adminTab === 'dashboard' && (
              <div className="tab-content">
                <div className="page-header">
                  <h2>Student Records Dashboard</h2>
                  <button className="btn btn-primary" onClick={() => { resetForm(); setAdminTab('add-student'); }}><UserPlus size={16} /> Register Student</button>
                </div>
                <div className="search-filters">
                  <div className="filter-group"><Search size={18} /><input placeholder="Search by Course..." value={searchCourse} onChange={e => setSearchCourse(e.target.value)} /></div>
                  <div className="filter-group"><Calendar size={18} /><input placeholder="Filter by Session..." value={searchSession} onChange={e => setSearchSession(e.target.value)} /></div>
                </div>
                {loading ? <div className="loading">Loading...</div> : filteredStudents.length === 0 ? (
                  <div className="empty-state"><User size={48} /><p>No students found.</p></div>
                ) : (
                  <div className="student-grid">
                    {filteredStudents.map(s => (
                      <div key={s.id} className="student-card">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="student-card-photo" />
                        ) : (
                          <div className="student-card-photo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', margin: '0 auto 12px' }}>
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
                        <span className={`status-badge ${s.isPublished ? 'published' : 'draft'}`} style={{ marginTop: '4px' }}>{s.isPublished ? 'Live' : 'Draft'}</span>
                        <div className="student-card-actions">
                          <button className="btn-view" onClick={() => { setActiveDocStudent(s); const c = courses.find(x => x.name === s.course); setActiveDocTerm(getTermNames(c)[0] || ''); }}><Printer size={12} style={{ display: 'inline', marginRight: '4px' }} /> View</button>
                          <button className="btn-edit" onClick={() => startEdit(s, false)}><Edit3 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Edit</button>
                          <button className="btn-primary btn-sm" onClick={() => startEdit(s, true)} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Complete</button>
                          <button className="btn-gold" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => { setPublishingStudent(s); setLocalPublishDocs(s.publishedDocs || {}); }}><CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Publish</button>
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
              <div className="tab-content form-panel">
                <h2>{editingStudentId ? (isCompleteEdit ? 'Complete Edit' : 'Partial Edit') : 'Register New Student'}</h2>
                <form onSubmit={handleSaveStudent}>
                  <div className="form-grid">
                    <div className="form-group"><label>Student Name *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>Father Name *</label><input value={formData.fatherName} onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>Mother Name *</label><input value={formData.motherName} onChange={e => setFormData(p => ({ ...p, motherName: e.target.value.toUpperCase() }))} required /></div>
                    <div className="form-group"><label>DOB (DD/MM/YYYY) *</label><input value={formData.dob} placeholder="DD/MM/YYYY" maxLength={10} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); let f = ''; if (d.length > 0) f = d.slice(0, 2); if (d.length > 2) f += '/' + d.slice(2, 4); if (d.length > 4) f += '/' + d.slice(4); setFormData(p => ({ ...p, dob: f })); }} required /></div>
                    <div className="form-group"><label>Course *</label>
                      {editingStudentId && !isCompleteEdit ? <input disabled value={formData.courseName} /> : (
                        <select value={formData.courseName} onChange={e => { setFormData(p => ({ ...p, courseName: e.target.value })); setSelectedTerm(''); }}>
                          <option value="">{courses.length === 0 ? 'Upload CSV first' : 'Select Course'}</option>
                          {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="form-group"><label>Session *</label><input value={formData.session} disabled={editingStudentId && !isCompleteEdit} onChange={e => setFormData(p => ({ ...p, session: e.target.value.toUpperCase() }))} placeholder="e.g. 2026 FINAL" required /></div>
                  </div>

                  {/* Photo */}
                  <div className="photo-upload-row">
                    <div className="photo-preview-box">{formData.photo ? <img src={formData.photo} alt="Preview" /> : <div className="placeholder"><Image size={32} /></div>}</div>
                    <div><label className="form-label">Upload Student Photo</label>
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = () => setCropSrc(r.result); r.readAsDataURL(e.target.files[0]); } }} />
                    </div>
                  </div>

                  {/* Marks Entry */}
                  {formData.courseName && (
                    <div className="marks-section">
                      <div className="marks-header">
                        <h3>Subject Marks Entry</h3>
                        <div className="term-controls">
                          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}>
                            {getTermNames(courses.find(c => c.name === formData.courseName)).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button type="button" className="btn btn-secondary" onClick={generateMarks}>Auto Generate</button>
                        </div>
                      </div>
                      <table className="marks-table">
                        <thead><tr><th>Code</th><th style={{ textAlign: 'left' }}>Subject</th><th>Min</th><th>Max</th><th>Obtained</th></tr></thead>
                        <tbody>
                          {getTermSubjects(courses.find(c => c.name === formData.courseName), selectedTerm).map(sub => (
                            <tr key={sub.code}>
                              <td>{sub.code}</td><td style={{ textAlign: 'left' }}>{sub.name}</td><td>{sub.minMarks}</td><td>{sub.maxMarks}</td>
                              <td><input type="number" min={0} max={sub.maxMarks} value={formMarksheets[selectedTerm]?.[sub.code] ?? ''} onChange={e => handleMarkChange(sub.code, e.target.value, sub.maxMarks)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => { resetForm(); setAdminTab('dashboard'); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editingStudentId ? 'Update' : 'Save & Register'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* COURSE MANAGER */}
            {adminTab === 'courses' && (
              <div className="tab-content">
                <h2>Course CSV Manager</h2>
                <div className="csv-uploader-row">
                  <div className="csv-upload-card">
                    <h3>Upload Course Mapping</h3>
                    <form onSubmit={handleCsvUpload}>
                      <div className="upload-dropzone">
                        <UploadCloud size={40} /><span>Select CSV File</span>
                        <input type="file" accept=".csv" onChange={e => { if (e.target.files[0]) { setCsvFile(e.target.files[0]); setCsvMessage(''); } }} />
                      </div>
                      {csvFile && <p>Selected: <strong>{csvFile.name}</strong></p>}
                      <button type="submit" className="btn btn-primary"><UploadCloud size={16} /> Process CSV</button>
                      {csvMessage && <div className={`message-banner ${csvMessage.includes('success') ? 'success' : ''}`}>{csvMessage}</div>}
                    </form>
                  </div>
                  <div className="courses-list-card">
                    <h3>Configured Courses ({courses.length})</h3>
                    {courses.length === 0 ? <p>No courses uploaded yet.</p> : courses.map(c => (
                      <div key={c.name} className="course-item">
                        <div><strong>{c.name}</strong><div style={{ fontSize: '11px', color: '#888' }}>Type: {c.type}</div></div>
                        <div className="terms-badges">
                          {Object.keys(c.terms).map(t => <span key={t} className="term-badge">{t}: {c.terms[t].length} Subjects</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* PORTAL PANEL */}
      {currentView === 'portal' && (
        <main className="portal-container">
          {!portalStudent ? (
            <div className="portal-search">
              <div className="portal-logo">
                <img src="/Monogram.png" alt="DSVV" />
                <h1>DEV SANSKRITI VISHWAVIDYALAYA</h1>
                <h2>STUDENT ONLINE DOCUMENT VERIFICATION HUB</h2>
              </div>
              <div className="portal-form">
                <div className="input-group"><User size={20} /><input placeholder="Student Full Name" value={portalName} onChange={e => setPortalName(e.target.value)} /></div>
                <div className="input-group"><FileText size={20} /><input placeholder="Roll Number or Enrollment Number" value={portalSearchVal} onChange={e => setPortalSearchVal(e.target.value)} /></div>
                <button className="btn btn-primary" onClick={handlePortalSearch} disabled={loading}><Search size={18} /> {loading ? 'Searching...' : 'Search'}</button>
                {portalError && <div className="portal-error"><AlertCircle size={18} /> {portalError}</div>}
              </div>
            </div>
          ) : (
            <div className="portal-hub">
              <div className="portal-hub-header">
                <button className="btn btn-outline btn-sm" onClick={() => { setPortalStudent(null); setPortalCourse(null); }}><ArrowLeft size={16} /> Back</button>
                <div className="hub-info">
                  <div className="hub-photo">{portalStudent.photo ? <img src={portalStudent.photo} alt="" /> : <User size={48} />}</div>
                  <div><h2>{portalStudent.name}</h2><p>Course: {portalStudent.course}</p><p>Roll: {portalStudent.rollNo}</p><p>Enroll: {portalStudent.enrollmentNo}</p><p>Session: {portalStudent.session}</p></div>
                </div>
              </div>
              <div className="portal-docs-workspace">
                <div className="portal-docs-sidebar">
                  <select value={portalActiveTerm} onChange={e => setPortalActiveTerm(e.target.value)}>
                    {Object.keys(portalStudent.marksheets).filter(t => { const d = portalStudent.publishedDocs || {}; return d.marksheets?.[t] || d.admitCards?.[t] || d.results?.[t]; }).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {portalStudent.publishedDocs?.marksheets?.[portalActiveTerm] && <button className={`doc-tab ${portalActiveTab === 'marksheet' ? 'active' : ''}`} onClick={() => setPortalActiveTab('marksheet')}><FileText size={18} /> Marksheet</button>}
                  {portalStudent.publishedDocs?.admitCards?.[portalActiveTerm] && <button className={`doc-tab ${portalActiveTab === 'admit' ? 'active' : ''}`} onClick={() => setPortalActiveTab('admit')}><Calendar size={18} /> Admit Card</button>}
                  {portalStudent.publishedDocs?.results?.[portalActiveTerm] && <button className={`doc-tab ${portalActiveTab === 'result' ? 'active' : ''}`} onClick={() => setPortalActiveTab('result')}><Globe size={18} /> Online Result</button>}
                  <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18} /> Print</button>
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

      {/* DOCUMENT MODAL */}
      {activeDocStudent && (
        <div className="modal-overlay" onClick={() => setActiveDocStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{activeDocStudent.name} - Documents</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={activeDocTerm} onChange={e => setActiveDocTerm(e.target.value)}>
                  {getTermNames(courses.find(c => c.name === activeDocStudent.course)).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}><Printer size={14} /> Print</button>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveDocStudent(null)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-tabs">
              <button className={activeDocTab === 'marksheet' ? 'active' : ''} onClick={() => setActiveDocTab('marksheet')}>Marksheet</button>
              <button className={activeDocTab === 'admit' ? 'active' : ''} onClick={() => setActiveDocTab('admit')}>Admit Card</button>
              <button className={activeDocTab === 'result' ? 'active' : ''} onClick={() => setActiveDocTab('result')}>Online Result</button>
            </div>
            <div className="modal-doc-preview">
              {activeDocTab === 'marksheet' && <MarksheetTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
              {activeDocTab === 'admit' && <AdmitCardTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
              {activeDocTab === 'result' && <OnlineResultTemplate student={activeDocStudent} course={courses.find(c => c.name === activeDocStudent.course)} termName={activeDocTerm} />}
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {publishingStudent && (
        <div className="modal-overlay" onClick={() => setPublishingStudent(null)}>
          <div className="modal-content publish-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publish: {publishingStudent.name}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setPublishingStudent(null)}><X size={18} /></button>
            </div>
            <div className="publish-options">
              <p style={{ fontSize: '13px', color: '#888' }}>Select which documents are visible on the student portal.</p>
              {Object.keys(publishingStudent.marksheets || {}).map(term => (
                <div key={term} className="publish-term-group">
                  <h4>{term}</h4>
                  <label><input type="checkbox" checked={!!localPublishDocs.marksheets?.[term]} onChange={e => setLocalPublishDocs(prev => ({ ...prev, marksheets: { ...(prev.marksheets || {}), [term]: e.target.checked } }))} /> Marksheet</label>
                  <label><input type="checkbox" checked={!!localPublishDocs.admitCards?.[term]} onChange={e => setLocalPublishDocs(prev => ({ ...prev, admitCards: { ...(prev.admitCards || {}), [term]: e.target.checked } }))} /> Admit Card</label>
                  <label><input type="checkbox" checked={!!localPublishDocs.results?.[term]} onChange={e => setLocalPublishDocs(prev => ({ ...prev, results: { ...(prev.results || {}), [term]: e.target.checked } }))} /> Online Result</label>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setPublishingStudent(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                const res = await fetch(`/api/students/${publishingStudent.id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publishedDocs: localPublishDocs }) });
                if (res.ok) { confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } }); setPublishingStudent(null); await fetchData(); }
              }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO CROPPER */}
      {cropSrc && (
        <ImageCropper src={cropSrc} onCropComplete={async (base64) => {
          try {
            const res = await fetch('/api/upload-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
            const data = await res.json();
            if (data.photoUrl) setFormData(p => ({ ...p, photo: data.photoUrl }));
          } catch { alert('Photo upload failed'); }
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
