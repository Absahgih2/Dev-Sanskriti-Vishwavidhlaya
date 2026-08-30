import React, { useState, useEffect, useRef } from 'react';
import {
  Search, UserPlus, UploadCloud, FileText, Calendar,
  Edit3, Trash2, Globe, Sliders, CheckCircle, Eye,
  Printer, ArrowLeft, User, Image, BookOpen,
  RefreshCw, X, AlertCircle, Building2, Home, Lock,
  LogOut, Check, Ban, Mail, Phone, ShieldCheck, UserCheck,
  Wallet, CreditCard, DollarSign, PlusCircle, ArrowUpRight, ArrowDownLeft,
  FileDown, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MarksheetTemplate, { calculateSemesterDetails } from './components/MarksheetTemplate';
import AdmitCardTemplate from './components/AdmitCardTemplate';
import OnlineResultTemplate from './components/OnlineResultTemplate';
import IdCardTemplate from './components/IdCardTemplate';
import ImageCropper from './components/ImageCropper';
import { downloadAsJpg, downloadAsPdf } from './utils/downloadDoc';
import { DEFAULT_COURSES, DEFAULT_STUDENTS, DEFAULT_CENTERS, parseCSVClient } from './defaultData';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return v === 'admin' || v === 'center' || v === 'portal' ? v : 'portal';
  });

  // Persistent Databases
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

  // Admin UI State
  const [adminTab, setAdminTab] = useState('dashboard');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSession, setSearchSession] = useState('');

  // Selective Publishing State
  const [publishingStudent, setPublishingStudent] = useState(null);
  const [localPublishDocs, setLocalPublishDocs] = useState({
    marksheets: {},
    admitCards: {},
    results: {}
  });

  // Student Form State (Exact Reference Layout)
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
    photo: '',
    centerCode: ''
  });
  const [selectedTerm, setSelectedTerm] = useState('');
  const [formMarksheets, setFormMarksheets] = useState({}); // { term: { subjectCode: mark } }
  const [formDmcNumbers, setFormDmcNumbers] = useState({}); // { term: dmcNo }
  const [formIssueDates, setFormIssueDates] = useState({}); // { term: issueDate }
  const [targetPercentage, setTargetPercentage] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isCompleteEdit, setIsCompleteEdit] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState('');

  // Wallet Modal State (Admin to Center Topup)
  const [walletTopupModal, setWalletTopupModal] = useState({
    open: false,
    centerId: '',
    centerName: '',
    centerCode: '',
    amount: '',
    description: 'Admin Wallet Recharge'
  });

  // Center Portal State
  const [centerTab, setCenterTab] = useState('candidates'); // 'candidates', 'add-candidate', 'wallet'
  const [centerSearch, setCenterSearch] = useState('');
  const [centerCourseFilter, setCenterCourseFilter] = useState('');
  const [centerSessionFilter, setCenterSessionFilter] = useState('');
  const [centerTopupRequestModal, setCenterTopupRequestModal] = useState(false);

  // Document Modal View State
  const [activeDocStudent, setActiveDocStudent] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('marksheet');
  const [activeDocTerm, setActiveDocTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Download DOM refs
  const docPreviewRef = useRef(null);
  const portalDocPreviewRef = useRef(null);

  // Document Export Handlers
  const handleDownloadJpg = async () => {
    if (!docPreviewRef.current || !activeDocStudent || isDownloading) return;
    setIsDownloading(true);
    const docName = `${activeDocStudent.rollNo}_${activeDocStudent.name}_${activeDocTab}_${activeDocTerm}`;
    const targetEl = docPreviewRef.current.querySelector('.marksheet-a4-landscape, .admit-card-layout, .idcard-dual-wrapper, .online-result-container') || docPreviewRef.current.firstElementChild || docPreviewRef.current;
    await downloadAsJpg(targetEl, docName);
    setIsDownloading(false);
  };

  const handleDownloadPdf = async () => {
    if (!docPreviewRef.current || !activeDocStudent || isDownloading) return;
    setIsDownloading(true);
    const docName = `${activeDocStudent.rollNo}_${activeDocStudent.name}_${activeDocTab}_${activeDocTerm}`;
    const targetEl = docPreviewRef.current.querySelector('.marksheet-a4-landscape, .admit-card-layout, .idcard-dual-wrapper, .online-result-container') || docPreviewRef.current.firstElementChild || docPreviewRef.current;
    await downloadAsPdf(targetEl, docName, activeDocTab);
    setIsDownloading(false);
  };

  const handlePortalDownloadJpg = async () => {
    if (!portalDocPreviewRef.current || !portalStudent || isDownloading) return;
    setIsDownloading(true);
    const docName = `${portalStudent.rollNo}_${portalStudent.name}_${portalActiveTab}_${portalActiveTerm}`;
    const targetEl = portalDocPreviewRef.current.querySelector('.marksheet-a4-landscape, .admit-card-layout, .idcard-dual-wrapper, .online-result-container') || portalDocPreviewRef.current.firstElementChild || portalDocPreviewRef.current;
    await downloadAsJpg(targetEl, docName);
    setIsDownloading(false);
  };

  const handlePortalDownloadPdf = async () => {
    if (!portalDocPreviewRef.current || !portalStudent || isDownloading) return;
    setIsDownloading(true);
    const docName = `${portalStudent.rollNo}_${portalStudent.name}_${portalActiveTab}_${portalActiveTerm}`;
    const targetEl = portalDocPreviewRef.current.querySelector('.marksheet-a4-landscape, .admit-card-layout, .idcard-dual-wrapper, .online-result-container') || portalDocPreviewRef.current.firstElementChild || portalDocPreviewRef.current;
    await downloadAsPdf(targetEl, docName, portalActiveTab);
    setIsDownloading(false);
  };

  // Public Result Portal State
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
    if (loggedCenter) {
      const refreshed = centers.find(c => c.id === loggedCenter.id);
      if (refreshed) {
        setLoggedCenter(refreshed);
        sessionStorage.setItem('dsvv_center_logged_in', JSON.stringify(refreshed));
      }
    }
  }, [centers]);

  const getNextSequentialNumbers = (sessionStr) => {
    const lastRoll = students.reduce((max, s) => Math.max(max, parseInt(s.rollNo) || 230000), 232150);
    const nextRoll = lastRoll + 1;
    const sessionYear = parseInt((sessionStr || '').match(/\b(20\d{2})\b/)?.[0] || '2024');
    const nextEnroll = `${sessionYear - 1}${nextRoll}`;
    return { nextRoll, nextEnroll };
  };

  const getTermNames = (course) => course ? Object.keys(course.terms || {}) : [];
  const getTermSubjects = (course, term) => (course && course.terms && course.terms[term]) || [];

  const getAutoIssueDate = (sessionStr, courseName, term) => {
    const c = courses.find(item => item.name.toLowerCase() === (courseName || '').toLowerCase());
    const terms = c ? getTermNames(c) : [];
    const tIdx = Math.max(0, terms.indexOf(term));
    const totalTerms = terms.length > 0 ? terms.length : 1;
    const { displayIssueDate } = calculateSemesterDetails(sessionStr, c?.type, term, tIdx, totalTerms);
    return displayIssueDate;
  };

  // ============================================================
  // AUTHENTICATION HANDLERS
  // ============================================================
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminLoginError('');
    const u = adminUsernameInput.trim();
    const p = adminPasswordInput.trim();

    if (u.toUpperCase() === 'DEV SANSKRITI VISHWAVIDYALAYA' && p === 'dsvv@2026') {
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
    setCenterTab('candidates');
  };

  const handleCenterSignOut = () => {
    setLoggedCenter(null);
    sessionStorage.removeItem('dsvv_center_logged_in');
  };

  const handleRegisterCenterSubmit = (e) => {
    e.preventDefault();
    if (!newCenterForm.centerName || !newCenterForm.centerCode || !newCenterForm.password) {
      alert('Please fill in all required center details.');
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
      walletBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: []
    };

    setCenters(prev => [newCenter, ...prev]);
    setShowCenterRegisterModal(false);
    setNewCenterForm({ centerName: '', centerCode: '', coordinatorName: '', email: '', phone: '', password: '' });
    setCenterRegisterSuccessMsg('Center Registration Submitted! Your Center will become active after approval by the University Administrator.');
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

  // ============================================================
  // WALLET OPERATIONS
  // ============================================================
  const openWalletTopupModal = (center) => {
    setWalletTopupModal({
      open: true,
      centerId: center.id,
      centerName: center.centerName,
      centerCode: center.centerCode,
      amount: '',
      description: 'Admin Wallet Recharge'
    });
  };

  const handleWalletTopupSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(walletTopupModal.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid recharge amount.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

    setCenters(prev => prev.map(c => {
      if (c.id === walletTopupModal.centerId) {
        const newBal = (c.walletBalance || 0) + amt;
        const tx = {
          id: `tx-${Date.now()}`,
          date: dateStr,
          type: 'credit',
          amount: amt,
          description: walletTopupModal.description || 'Admin Wallet Recharge',
          balanceAfter: newBal
        };
        return {
          ...c,
          walletBalance: newBal,
          transactions: [tx, ...(c.transactions || [])]
        };
      }
      return c;
    }));

    setWalletTopupModal({ open: false, centerId: '', centerName: '', centerCode: '', amount: '', description: '' });
    confetti({ particleCount: 70, spread: 60 });
  };

  // ============================================================
  // SELECTIVE PUBLISHING HANDLERS
  // ============================================================
  const startPublishDocs = (student) => {
    setPublishingStudent(student);
    const defaults = { marksheets: {}, admitCards: {}, results: {} };
    const course = courses.find(c => c.name.toLowerCase() === student.course.toLowerCase());
    const terms = course ? getTermNames(course) : Object.keys(student.marksheets || {});
    terms.forEach(t => {
      defaults.marksheets[t] = student.publishedDocs?.marksheets?.[t] ?? true;
      defaults.admitCards[t] = student.publishedDocs?.admitCards?.[t] ?? true;
      defaults.results[t] = student.publishedDocs?.results?.[t] ?? true;
    });
    setLocalPublishDocs(student.publishedDocs || defaults);
  };

  const submitPublishSettings = () => {
    if (!publishingStudent) return;
    const hasAny = Object.values(localPublishDocs.marksheets || {}).some(v => v) ||
                   Object.values(localPublishDocs.admitCards || {}).some(v => v) ||
                   Object.values(localPublishDocs.results || {}).some(v => v);

    setStudents(prev => prev.map(s => {
      if (s.id === publishingStudent.id) {
        return {
          ...s,
          isPublished: hasAny,
          publishedDocs: localPublishDocs
        };
      }
      return s;
    }));

    setPublishingStudent(null);
    confetti({ particleCount: 50, spread: 40 });
  };

  // ============================================================
  // STUDENT REGISTRATION & MARKS ALGORITHM (GURUKUL WORKFLOW)
  // ============================================================
  const resetForm = () => {
    const { nextRoll, nextEnroll } = getNextSequentialNumbers('2024-2026');
    setFormData({
      name: '',
      fatherName: '',
      motherName: '',
      dob: '',
      courseName: courses[0]?.name || '',
      session: '2024-2026',
      email: '',
      rollNo: nextRoll,
      enrollmentNo: nextEnroll,
      photo: '',
      centerCode: loggedCenter ? loggedCenter.centerCode : ''
    });
    const c = courses[0];
    const firstTerm = c ? getTermNames(c)[0] : '';
    const autoDate = getAutoIssueDate('2024-2026', c?.name, firstTerm);
    setSelectedTerm(firstTerm || '');
    setFormMarksheets({});
    setFormDmcNumbers({ [firstTerm]: Math.floor(1000 + Math.random() * 9000) });
    setFormIssueDates({ [firstTerm]: autoDate });
    setTargetPercentage('');
    setEditingStudentId(null);
    setIsCompleteEdit(false);
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
      photo: student.photo,
      centerCode: student.centerCode || ''
    });
    const terms = Object.keys(student.marksheets || {});
    const initialMarks = {};
    const initialDmcs = {};
    const initialDates = {};
    terms.forEach(t => {
      initialMarks[t] = student.marksheets[t]?.marks || {};
      initialDmcs[t] = student.marksheets[t]?.dmcNo || '';
      initialDates[t] = student.marksheets[t]?.issueDate || '';
    });
    setFormMarksheets(initialMarks);
    setFormDmcNumbers(initialDmcs);
    setFormIssueDates(initialDates);
    setSelectedTerm(terms[0] || '');
    setAdminTab('add-student');
  };

  const handleMarkChange = (subCode, val, maxMarks) => {
    const num = val === '' ? '' : Math.min(maxMarks, Math.max(0, parseInt(val) || 0));
    setFormMarksheets(prev => ({
      ...prev,
      [selectedTerm]: { ...(prev[selectedTerm] || {}), [subCode]: num }
    }));
  };

  // Gurukul Precise Percentage Distribution Algorithm
  const handleGenerateMarks = () => {
    const pctVal = parseInt(targetPercentage);
    if (isNaN(pctVal) || pctVal < 35 || pctVal > 100) {
      alert('Please enter a target percentage between 35 and 100.');
      return;
    }

    const course = courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase());
    if (!course || !selectedTerm || !course.terms[selectedTerm]) {
      alert('Please select a valid course and term/semester first.');
      return;
    }

    const activeSubjects = course.terms[selectedTerm];
    const totalMaxMarks = activeSubjects.reduce((sum, s) => sum + (parseInt(s.maxMarks) || 100), 0);
    const targetTotal = Math.round(totalMaxMarks * (pctVal / 100));

    let lowBound = 40;
    let highBound = 80;

    if (pctVal < 40) {
      lowBound = Math.max(0, pctVal - 10);
      highBound = Math.min(100, pctVal + 15);
    } else if (pctVal > 80) {
      lowBound = Math.max(0, pctVal - 15);
      highBound = Math.min(100, pctVal + 10);
    }

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

    let diff = targetTotal - currentSum;
    let attempts = 0;
    const maxAttempts = 1000;

    while (diff !== 0 && attempts < maxAttempts) {
      attempts++;
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

    if (!formDmcNumbers[selectedTerm]) {
      setFormDmcNumbers(prev => ({ ...prev, [selectedTerm]: Math.floor(1000 + Math.random() * 9000) }));
    }
    if (!formIssueDates[selectedTerm] || formIssueDates[selectedTerm] === '') {
      const autoDate = getAutoIssueDate(formData.session, formData.courseName, selectedTerm);
      setFormIssueDates(prev => ({ ...prev, [selectedTerm]: autoDate }));
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName || !formData.motherName || !formData.dob || !formData.courseName || !formData.session) {
      alert('Please fill all required fields.');
      return;
    }

    const isCenterAction = currentView === 'center' && loggedCenter;
    const admissionFee = 500;

    if (isCenterAction && !editingStudentId) {
      if ((loggedCenter.walletBalance || 0) < admissionFee) {
        alert(`Insufficient Center Wallet Balance (Available: ₹${loggedCenter.walletBalance || 0}). Registration requires ₹${admissionFee}. Please request a wallet recharge from Admin.`);
        return;
      }
    }

    const course = courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase());
    const terms = getTermNames(course);
    const marksheetsData = {};

    terms.forEach((t) => {
      const autoDate = getAutoIssueDate(formData.session, formData.courseName, t);
      marksheetsData[t] = {
        dmcNo: formDmcNumbers[t] || Math.floor(1000 + Math.random() * 9000),
        issueDate: formIssueDates[t] || autoDate,
        marks: formMarksheets[t] || {}
      };
    });

    const publishedDocs = { marksheets: {}, admitCards: {}, results: {} };
    terms.forEach(t => {
      publishedDocs.marksheets[t] = true;
      publishedDocs.admitCards[t] = true;
      publishedDocs.results[t] = true;
    });

    if (editingStudentId) {
      const existing = students.find(s => s.id === editingStudentId);
      const updated = {
        ...existing,
        ...formData,
        course: formData.courseName,
        marksheets: marksheetsData,
        publishedDocs: existing?.publishedDocs || publishedDocs
      };
      setStudents(prev => prev.map(s => s.id === editingStudentId ? updated : s));
    } else {
      const newStudent = {
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
        centerCode: isCenterAction ? loggedCenter.centerCode : (formData.centerCode || 'DSVV-MAIN'),
        isPublished: true,
        marksheets: marksheetsData,
        publishedDocs
      };

      setStudents(prev => [newStudent, ...prev]);

      if (isCenterAction) {
        const newBal = (loggedCenter.walletBalance || 0) - admissionFee;
        const tx = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          type: 'debit',
          amount: admissionFee,
          description: `Candidate Admission Fee (${formData.name} - Roll: ${formData.rollNo})`,
          balanceAfter: newBal
        };

        setCenters(prev => prev.map(c => {
          if (c.id === loggedCenter.id) {
            return { ...c, walletBalance: newBal, transactions: [tx, ...(c.transactions || [])] };
          }
          return c;
        }));
      }

      confetti({ particleCount: 80, spread: 60 });
    }

    if (currentView === 'admin') {
      setAdminTab('dashboard');
    } else if (currentView === 'center') {
      setCenterTab('candidates');
    }
    resetForm();
  };

  
  const handleDeleteCourse = (courseName) => {
    if (!confirm(`Are you sure you want to delete the course "${courseName}" and its semester curriculum?`)) return;
    setCourses(prev => {
      const updated = prev.filter(c => c.name.toLowerCase() !== courseName.toLowerCase());
      localStorage.setItem('dsvv_courses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteStudent = (id) => {
    if (!confirm('Delete this candidate record?')) return;
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleCsvUpload = (e) => {
    e.preventDefault();
    if (!csvFile) { setCsvMessage('Please select a CSV file first.'); return; }
    setCsvMessage('Processing CSV...');

    const reader = new FileReader();
    reader.onload = (evt) => {
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
              const idx = updated.findIndex(c => c.name.toLowerCase() === nc.name.toLowerCase());
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

  // ============================================================
  // PUBLIC RESULT PORTAL SEARCH
  // ============================================================
  const handlePortalSearch = () => {
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
      if (!found.isPublished) {
        setPortalError('Documents for this student are currently in draft state and have not been published by the University.');
        return;
      }
      const course = courses.find(c => c.name.toLowerCase() === found.course.toLowerCase());
      setPortalStudent(found);
      setPortalCourse(course || { name: found.course, terms: {} });
      const terms = Object.keys(found.marksheets || {});
      setPortalActiveTerm(terms[0] || '');
      setPortalActiveTab('marksheet');
    } else {
      setPortalError('No student record found matching the provided credentials. Please check the spelling and Roll/Enrollment Number.');
    }
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    const mc = searchCourse ? s.course?.toLowerCase().includes(searchCourse.toLowerCase()) : true;
    const ms = searchSession ? s.session?.toLowerCase().includes(searchSession.toLowerCase()) : true;
    return mc && ms;
  });

  const centerFilteredStudents = students.filter(s => {
    const matchCenter = loggedCenter ? (s.centerCode === loggedCenter.centerCode || !s.centerCode) : true;
    const matchSearch = centerSearch ? (
      s.name?.toLowerCase().includes(centerSearch.toLowerCase()) ||
      String(s.rollNo)?.includes(centerSearch) ||
      s.enrollmentNo?.toLowerCase().includes(centerSearch.toLowerCase())
    ) : true;
    const matchCourse = centerCourseFilter ? s.course?.toLowerCase().includes(centerCourseFilter.toLowerCase()) : true;
    const matchSession = centerSessionFilter ? s.session?.toLowerCase().includes(centerSessionFilter.toLowerCase()) : true;
    return matchCenter && matchSearch && matchCourse && matchSession;
  });

  return (
    <div className={`app-root-container no-print ${currentView === 'portal' ? 'portal-view' : 'admin-view'}`}>
      
      {/* ============================================================
          TOP HEADER
         ============================================================ */}
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
              {/* DASHBOARD TAB (EXACT GURUKUL CARD LAYOUT WITH PUBLISH, PARTIAL, COMPLETE) */}
              {adminTab === 'dashboard' && (
                <div className="tab-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0d2149' }}>Student Records Dashboard</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Total registered students: {students.length}</p>
                    </div>
                    <button className="btn-primary" onClick={() => { resetForm(); setAdminTab('add-student'); }}>
                      <UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Register Student
                    </button>
                  </div>
                  
                  <div className="search-filters" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Search by Course..." value={searchCourse} onChange={e => setSearchCourse(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Filter by Session..." value={searchSession} onChange={e => setSearchSession(e.target.value)} />
                    </div>
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
                      <User size={48} style={{ color: '#ccc', marginBottom: '10px' }} />
                      <p>No student records found.</p>
                    </div>
                  ) : (
                    <div className="student-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                      {filteredStudents.map(s => (
                        <div key={s.id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          
                          {/* Student Header */}
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {s.photo ? (
                                <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <User size={28} style={{ color: '#94a3b8' }} />
                              )}
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{s.name}</h3>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>{s.session}</span>
                            </div>
                          </div>

                          {/* Student Details */}
                          <div style={{ fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '5px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Roll No:</span> <strong>{s.rollNo}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Enroll No:</span> <strong>{s.enrollmentNo}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Course:</span> <strong style={{ textAlign: 'right', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.course}</strong></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <span style={{ color: '#64748b' }}>Status:</span>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background: s.isPublished ? '#dcfce7' : '#f1f5f9',
                                color: s.isPublished ? '#166534' : '#64748b'
                              }}>
                                {s.isPublished ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons: View, Partial, Complete, Publish, Live, Delete */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 10px', fontSize: '11.5px' }}
                              onClick={() => { setActiveDocStudent(s); const c = courses.find(x => x.name.toLowerCase() === s.course.toLowerCase()); setActiveDocTerm(getTermNames(c)[0] || ''); }}
                              title="View and Print Documents"
                            >
                              <Eye size={13} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> View
                            </button>

                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 10px', fontSize: '11.5px' }}
                              onClick={() => startEdit(s, false)}
                              title="Partial Edit: Student Details & Marks"
                            >
                              <Edit3 size={13} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Partial
                            </button>

                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 10px', fontSize: '11.5px' }}
                              onClick={() => startEdit(s, true)}
                              title="Complete Edit: Change Structure"
                            >
                              <Sliders size={13} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Complete
                            </button>

                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '11.5px', background: '#0d2149' }}
                              onClick={() => startPublishDocs(s)}
                              title="Configure publishing settings for Student Web Portal"
                            >
                              <CheckCircle size={13} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Publish
                            </button>

                            {s.isPublished && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11.5px', color: '#16a34a', fontWeight: '700' }} title="Live on Web Portal">
                                <CheckCircle size={13} /> Live
                              </span>
                            )}

                            <button 
                              className="btn-delete" 
                              style={{ padding: '6px 8px', marginLeft: 'auto' }}
                              onClick={() => handleDeleteStudent(s.id)}
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADD/EDIT STUDENT (EXACT GURUKUL WORKFLOW & LAYOUT) */}
              {adminTab === 'add-student' && (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: '1080px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                      {editingStudentId ? (isCompleteEdit ? 'Complete Structure Edit' : 'Partial Student Edit') : 'Register New Student'}
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
                          onChange={e => {
                            const cName = e.target.value;
                            const course = courses.find(c => c.name.toLowerCase() === cName.toLowerCase());
                            const firstTerm = course ? getTermNames(course)[0] : '';
                            const autoDate = getAutoIssueDate(formData.session, cName, firstTerm);
                            setFormData(p => ({ ...p, courseName: cName }));
                            setSelectedTerm(firstTerm || '');
                            if (firstTerm && !formDmcNumbers[firstTerm]) {
                              setFormDmcNumbers(prev => ({ ...prev, [firstTerm]: Math.floor(1000 + Math.random() * 9000) }));
                              setFormIssueDates(prev => ({ ...prev, [firstTerm]: autoDate }));
                            }
                          }} 
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

                    {/* ============================================================
                        SUBJECT MARKS ENTRY SECTION (EXACT GURUKUL WORKFLOW)
                       ============================================================ */}
                    {formData.courseName && (
                      <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', marginBottom: '28px' }}>
                        
                        {/* Header: Title & Semester Selector */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0d2149', fontWeight: '700' }}>
                            SUBJECT MARKS ENTRY
                          </h3>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Select Semester/Year:</span>
                            <select 
                              value={selectedTerm} 
                              onChange={e => {
                                const t = e.target.value;
                                setSelectedTerm(t);
                                const autoDate = getAutoIssueDate(formData.session, formData.courseName, t);
                                if (!formDmcNumbers[t]) {
                                  setFormDmcNumbers(prev => ({ ...prev, [t]: Math.floor(1000 + Math.random() * 9000) }));
                                }
                                if (!formIssueDates[t]) {
                                  setFormIssueDates(prev => ({ ...prev, [t]: autoDate }));
                                }
                              }} 
                              style={{ padding: '8px 14px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
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

                        {/* Auto-generate Marks Block (Target Percentage + Generate Button) */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Target Percentage:</span>
                            <input 
                              type="number"
                              min={35}
                              max={100}
                              placeholder="e.g. 75"
                              value={targetPercentage}
                              onChange={e => setTargetPercentage(e.target.value)}
                              style={{ width: '100px', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <span style={{ fontWeight: '700', color: '#475569' }}>%</span>
                          </div>
                          <button 
                            type="button" 
                            className="btn-primary"
                            style={{ margin: 0, padding: '8px 20px', fontSize: '13px', background: '#0d2149' }}
                            onClick={handleGenerateMarks}
                          >
                            Generate Marks
                          </button>
                        </div>

                        {/* DMC Number & Date of Issue Row */}
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap', background: '#ffffff', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>DMC Number for {selectedTerm || 'Term'}:</span>
                            <input 
                              type="text"
                              placeholder="e.g. 1001"
                              value={formDmcNumbers[selectedTerm] || ''}
                              onChange={e => setFormDmcNumbers(prev => ({ ...prev, [selectedTerm]: e.target.value }))}
                              style={{ width: '150px', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Date of Issue:</span>
                            <input 
                              type="text"
                              placeholder="DD-MM-YYYY"
                              value={formIssueDates[selectedTerm] || ''}
                              onChange={e => setFormIssueDates(prev => ({ ...prev, [selectedTerm]: e.target.value }))}
                              style={{ width: '150px', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </div>
                        </div>

                        {/* Subject Marks Table */}
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1.5px solid #cbd5e1' }}>
                                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Code</th>
                                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Subject</th>
                                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Min Marks</th>
                                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Max Marks</th>
                                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', width: '180px' }}>Obtained Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getTermSubjects(courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase()), selectedTerm).map((sub, idx) => (
                                <tr key={sub.code} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#0d2149' }}>{sub.code}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{sub.name}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center', color: '#64748b' }}>{sub.minMarks}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center', color: '#64748b' }}>{sub.maxMarks}</td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <input 
                                      type="number"
                                      min={0}
                                      max={sub.maxMarks}
                                      placeholder={`Max ${sub.maxMarks}`}
                                      value={formMarksheets[selectedTerm]?.[sub.code] !== undefined ? formMarksheets[selectedTerm][sub.code] : ''}
                                      onChange={e => handleMarkChange(sub.code, e.target.value, sub.maxMarks)}
                                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '13px', width: '120px', textAlign: 'center' }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    )}

                    {/* Bottom Actions */}
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
                          <div key={c.name} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <div>
                              <strong style={{ color: '#0d2149', fontSize: '14px' }}>{c.name}</strong>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Type: {c.type?.toUpperCase()} | Terms: {Object.keys(c.terms || {}).length}</div>
                            </div>
                            <button 
                              type="button"
                              className="btn-delete" 
                              style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }} 
                              onClick={() => handleDeleteCourse(c.name)}
                              title="Delete Course"
                            >
                              <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Delete Course
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CENTER ADMISSIONS & WALLET MANAGEMENT TAB */}
              {adminTab === 'centers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0d2149' }}>Examination Center Admissions & Wallet Top-up</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Manage registered study centers, approve accounts, and credit wallet balances for admissions</p>
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
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Wallet Balance</th>
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
                                  <span style={{ fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                                    ₹{(c.walletBalance || 0).toLocaleString('en-IN')}
                                  </span>
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
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                                      <>
                                        <button 
                                          className="btn-primary" 
                                          style={{ padding: '5px 10px', fontSize: '11px', background: '#0d2149' }}
                                          onClick={() => openWalletTopupModal(c)}
                                          title="Recharge Center Wallet"
                                        >
                                          <Wallet size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> Recharge
                                        </button>
                                        <button 
                                          className="btn-secondary" 
                                          style={{ padding: '5px 8px', fontSize: '11px', color: '#dc2626' }}
                                          onClick={() => handleRejectCenter(c.id)}
                                          title="Revoke Approval"
                                        >
                                          <Ban size={13} />
                                        </button>
                                      </>
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
          2. CENTER PORTAL VIEW (WITH WALLET & ADMISSIONS)
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
            
            {/* Center Header Card & Wallet Summary */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, color: '#0d2149' }}>{loggedCenter.centerName}</h2>
                    <span style={{ padding: '3px 10px', background: '#d4af37', color: '#0d2149', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {loggedCenter.centerCode}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                    Coordinator: <strong>{loggedCenter.coordinatorName || 'Center Head'}</strong> &bull; Examination Center Portal
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={20} style={{ color: '#16a34a' }} />
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#15803d' }}>Wallet Balance</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#166534' }}>
                        ₹{(loggedCenter.walletBalance || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <button className="btn-secondary" onClick={handleCenterSignOut} style={{ color: '#dc2626' }}>
                    <LogOut size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Sign Out
                  </button>
                </div>
              </div>

              {/* Navigation Tabs for Center */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <button 
                  className={`nav-mode-btn ${centerTab === 'candidates' ? 'active' : ''}`}
                  onClick={() => setCenterTab('candidates')}
                >
                  <Eye size={15} /> Candidate List
                </button>
                <button 
                  className={`nav-mode-btn ${centerTab === 'add-candidate' ? 'active' : ''}`}
                  onClick={() => { resetForm(); setCenterTab('add-candidate'); }}
                >
                  <UserPlus size={15} /> Register Candidate
                </button>
                <button 
                  className={`nav-mode-btn ${centerTab === 'wallet' ? 'active' : ''}`}
                  onClick={() => setCenterTab('wallet')}
                >
                  <CreditCard size={15} /> Wallet & Transactions
                </button>
              </div>
            </div>

            {/* TAB 1: CANDIDATE LIST */}
            {centerTab === 'candidates' && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <input style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} placeholder="Search Student Name / Roll No..." value={centerSearch} onChange={e => setCenterSearch(e.target.value)} />
                  <select style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} value={centerCourseFilter} onChange={e => setCenterCourseFilter(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <input style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }} placeholder="Filter Session..." value={centerSessionFilter} onChange={e => setCenterSessionFilter(e.target.value)} />
                </div>

                <h3 style={{ marginBottom: '16px' }}>Enrolled Candidates ({centerFilteredStudents.length})</h3>
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
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>ID Card</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centerFilteredStudents.map((s, idx) => {
                        const c = courses.find(x => x.name.toLowerCase() === s.course.toLowerCase());
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
                              <button className="btn-view" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => { setActiveDocStudent(s); setActiveDocTerm(firstTerm); setActiveDocTab('idcard'); }}>
                                <UserCheck size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> ID Card
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
            )}

            {/* TAB 2: REGISTER NEW CANDIDATE VIA CENTER */}
            {centerTab === 'add-candidate' && (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', maxWidth: '1080px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Register Candidate for Examination</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Admission Fee of ₹500 will be debited from your Center Wallet.</p>
                  </div>
                  <div style={{ padding: '6px 14px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                    Wallet Balance: ₹{(loggedCenter.walletBalance || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <form onSubmit={handleSaveStudent}>
                  {/* Row 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>STUDENT NAME</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value.toUpperCase() }))} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>FATHER'S NAME</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} value={formData.fatherName} onChange={e => setFormData(p => ({ ...p, fatherName: e.target.value.toUpperCase() }))} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>MOTHER'S NAME</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} value={formData.motherName} onChange={e => setFormData(p => ({ ...p, motherName: e.target.value.toUpperCase() }))} required />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>DATE OF BIRTH (DD/MM/YYYY)</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} placeholder="DD/MM/YYYY" maxLength={10} value={formData.dob} onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 8); let f = ''; if (d.length > 0) f = d.slice(0, 2); if (d.length > 2) f += '/' + d.slice(2, 4); if (d.length > 4) f += '/' + d.slice(4); setFormData(p => ({ ...p, dob: f })); }} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>COURSE</label>
                      <select style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff' }} value={formData.courseName} onChange={e => { const cName = e.target.value; const c = courses.find(x => x.name.toLowerCase() === cName.toLowerCase()); setSelectedTerm(c ? getTermNames(c)[0] : ''); setFormData(p => ({ ...p, courseName: cName })); }} required>
                        <option value="">Select Course</option>
                        {courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>SESSION (FINAL END YEAR)</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} placeholder="e.g. 2026 FINAL or 2024-2026" value={formData.session} onChange={e => setFormData(p => ({ ...p, session: e.target.value.toUpperCase() }))} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>EMAIL ID</label>
                      <input type="email" style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }} placeholder="student@example.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>ROLL NUMBER</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc' }} value={formData.rollNo} onChange={e => setFormData(p => ({ ...p, rollNo: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>ENROLLMENT NUMBER</label>
                      <input style={{ padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#f8fafc' }} value={formData.enrollmentNo} onChange={e => setFormData(p => ({ ...p, enrollmentNo: e.target.value }))} required />
                    </div>
                  </div>

                  {/* Row 4 Photo */}
                  <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {formData.photo ? <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Image size={32} style={{ color: '#94a3b8' }} />}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>UPLOAD CANDIDATE PHOTO</label>
                      <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = () => setCropSrc(r.result); r.readAsDataURL(e.target.files[0]); } }} />
                    </div>
                  </div>

                  {/* Marks Entry for Center */}
                  {formData.courseName && (
                    <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0d2149' }}>SUBJECT MARKS ENTRY</h3>
                        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          {getTermNames(courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase())).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Target Percentage:</span>
                          <input type="number" min={35} max={100} placeholder="e.g. 75" value={targetPercentage} onChange={e => setTargetPercentage(e.target.value)} style={{ width: '90px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                          <span>%</span>
                        </div>
                        <button type="button" className="btn-primary" style={{ margin: 0, padding: '6px 16px', fontSize: '12px' }} onClick={handleGenerateMarks}>Generate Marks</button>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Code</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Subject</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Max</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', width: '140px' }}>Obtained</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getTermSubjects(courses.find(c => c.name.toLowerCase() === formData.courseName.toLowerCase()), selectedTerm).map(sub => (
                            <tr key={sub.code} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px 12px' }}>{sub.code}</td>
                              <td style={{ padding: '8px 12px' }}>{sub.name}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>{sub.maxMarks}</td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <input type="number" min={0} max={sub.maxMarks} value={formMarksheets[selectedTerm]?.[sub.code] ?? ''} onChange={e => handleMarkChange(sub.code, e.target.value, sub.maxMarks)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '90px', textAlign: 'center' }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setCenterTab('candidates')}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>Pay ₹500 & Register Candidate</button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: WALLET & TRANSACTIONS */}
            {centerTab === 'wallet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, #0d2149, #1e3a6e)', color: '#fff', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#d4af37', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Available Center Balance</span>
                    <h1 style={{ fontSize: '2.4rem', margin: '6px 0 0', fontWeight: '800' }}>₹{(loggedCenter.walletBalance || 0).toLocaleString('en-IN')}</h1>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94a3b8' }}>Center ID: {loggedCenter.centerCode} &bull; Used for candidate examination registrations</p>
                  </div>
                  <button className="btn-primary" style={{ background: '#d4af37', color: '#0d2149', fontWeight: '700', padding: '12px 24px', fontSize: '14px' }} onClick={() => setCenterTopupRequestModal(true)}>
                    <PlusCircle size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Request Wallet Recharge
                  </button>
                </div>

                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ marginBottom: '16px', color: '#0d2149' }}>Transaction History</h3>
                  {(!loggedCenter.transactions || loggedCenter.transactions.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No transactions recorded yet.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                          <th style={{ padding: '10px 14px' }}>Date & Time</th>
                          <th style={{ padding: '10px 14px' }}>Type</th>
                          <th style={{ padding: '10px 14px' }}>Description</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Balance After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loggedCenter.transactions.map((tx, idx) => (
                          <tr key={tx.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '13px' }}>{tx.date}</td>
                            <td style={{ padding: '12px 14px' }}>
                              {tx.type === 'credit' ? (
                                <span style={{ color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>CREDIT</span>
                              ) : (
                                <span style={{ color: '#991b1b', background: '#fee2e2', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>DEBIT</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: '500' }}>{tx.description}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>
                              {tx.type === 'credit' ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600' }}>
                              ₹{(tx.balanceAfter || 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
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
                <button className="btn-primary" onClick={handlePortalSearch}>
                  <Search size={18} /> Search Record
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
                  
                  {(!portalStudent.publishedDocs?.marksheets || portalStudent.publishedDocs.marksheets[portalActiveTerm] !== false) && (
                    <button className={`doc-tab ${portalActiveTab === 'marksheet' ? 'active' : ''}`} onClick={() => setPortalActiveTab('marksheet')}>
                      <FileText size={18} /> Marksheet
                    </button>
                  )}

                  {(!portalStudent.publishedDocs?.admitCards || portalStudent.publishedDocs.admitCards[portalActiveTerm] !== false) && (
                    <button className={`doc-tab ${portalActiveTab === 'admit' ? 'active' : ''}`} onClick={() => setPortalActiveTab('admit')}>
                      <Calendar size={18} /> Admit Card
                    </button>
                  )}

                  {(!portalStudent.publishedDocs?.results || portalStudent.publishedDocs.results[portalActiveTerm] !== false) && (
                    <button className={`doc-tab ${portalActiveTab === 'result' ? 'active' : ''}`} onClick={() => setPortalActiveTab('result')}>
                      <Globe size={18} /> Online Result
                    </button>
                  )}

                  <button className={`doc-tab ${portalActiveTab === 'idcard' ? 'active' : ''}`} onClick={() => setPortalActiveTab('idcard')}>
                    <UserCheck size={18} /> Identity Card
                  </button>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button className="btn-primary" style={{ width: '100%', margin: 0 }} onClick={() => window.print()}>
                      <Printer size={16} style={{ marginRight: '6px' }} /> Print Document
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#0284c7', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }} onClick={handlePortalDownloadJpg} disabled={isDownloading}>
                      <Image size={16} /> {isDownloading ? 'Exporting...' : 'Download JPG'}
                    </button>
                    <button className="btn-primary" style={{ width: '100%', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }} onClick={handlePortalDownloadPdf} disabled={isDownloading}>
                      <FileDown size={16} /> {isDownloading ? 'Exporting...' : 'Download PDF'}
                    </button>
                  </div>
                </div>
                
                <div className="portal-doc-preview" ref={portalDocPreviewRef}>
                  {portalActiveTab === 'marksheet' && <MarksheetTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
                  {portalActiveTab === 'admit' && <AdmitCardTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
                  {portalActiveTab === 'idcard' && <IdCardTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
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

      {/* SELECTIVE PUBLISHING OPTIONS MODAL (GURUKUL WORKFLOW) */}
      {publishingStudent && (
        <div className="modal-overlay" onClick={() => setPublishingStudent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0d2149' }}>Publishing Options: {publishingStudent.name}</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Roll No: {publishingStudent.rollNo}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setPublishingStudent(null)}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Select which student documents should be visible and accessible on the public web verification portal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.keys(publishingStudent.marksheets || {}).map(term => (
                <div key={term} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0d2149', display: 'block', marginBottom: '12px' }}>
                    {term.toUpperCase()}
                  </strong>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13px' }}>
                      <span>Marksheet Statement</span>
                      <input 
                        type="checkbox"
                        style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        checked={localPublishDocs.marksheets?.[term] ?? true}
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
                        style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        checked={localPublishDocs.admitCards?.[term] ?? true}
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
                        style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        checked={localPublishDocs.results?.[term] ?? true}
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

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
              <button type="button" className="btn-secondary" onClick={() => setPublishingStudent(null)}>Cancel</button>
              <button type="button" className="btn-primary" style={{ background: '#0d2149' }} onClick={submitPublishSettings}>Confirm & Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN WALLET TOPUP MODAL */}
      {walletTopupModal.open && (
        <div className="modal-overlay" onClick={() => setWalletTopupModal(p => ({ ...p, open: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0d2149' }}>Recharge Center Wallet</h3>
              <button className="modal-close-btn" onClick={() => setWalletTopupModal(p => ({ ...p, open: false }))}><X size={18} /></button>
            </div>
            <form onSubmit={handleWalletTopupSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Center</label>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', fontWeight: '600', color: '#0d2149', fontSize: '13px' }}>
                  {walletTopupModal.centerName} ({walletTopupModal.centerCode})
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Recharge Amount (₹) *</label>
                <input 
                  type="number" 
                  placeholder="e.g. 10000" 
                  value={walletTopupModal.amount} 
                  onChange={e => setWalletTopupModal(p => ({ ...p, amount: e.target.value }))} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Description</label>
                <input 
                  placeholder="e.g. Fee Advance Credit" 
                  value={walletTopupModal.description} 
                  onChange={e => setWalletTopupModal(p => ({ ...p, description: e.target.value }))} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setWalletTopupModal(p => ({ ...p, open: false }))}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#16a34a' }}>Credit Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENTER RECHARGE REQUEST MODAL */}
      {centerTopupRequestModal && (
        <div className="modal-overlay" onClick={() => setCenterTopupRequestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#0d2149' }}>Request Wallet Top-up</h3>
              <button className="modal-close-btn" onClick={() => setCenterTopupRequestModal(false)}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              To recharge your Center Wallet balance, please deposit funds via University Bank Transfer / UPI and contact University Admin:
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Bank Name:</strong> State Bank of India</div>
              <div><strong>Account Name:</strong> Dev Sanskriti Vishwavidyalaya</div>
              <div><strong>Account No:</strong> 34098234891</div>
              <div><strong>IFSC Code:</strong> SBIN0001234</div>
              <div><strong>Admin Helpline:</strong> +91-9876543210</div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setCenterTopupRequestModal(false)}>Close</button>
          </div>
        </div>
      )}

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
                  <input placeholder="e.g. DSVV BILASPUR REGIONAL CENTER" value={newCenterForm.centerName} onChange={e => setNewCenterForm(p => ({ ...p, centerName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Desired Center ID / Code *</label>
                  <input placeholder="e.g. DSVV-CTR-02" value={newCenterForm.centerCode} onChange={e => setNewCenterForm(p => ({ ...p, centerCode: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Coordinator Name</label>
                  <input placeholder="e.g. DR. R.K. VERMA" value={newCenterForm.coordinatorName} onChange={e => setNewCenterForm(p => ({ ...p, coordinatorName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="center@devsanskritivishwavidyalaya.com" value={newCenterForm.email} onChange={e => setNewCenterForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input placeholder="+91-XXXXXXXXXX" value={newCenterForm.phone} onChange={e => setNewCenterForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Create Login Password *</label>
                  <input type="password" placeholder="Enter secure password" value={newCenterForm.password} onChange={e => setNewCenterForm(p => ({ ...p, password: e.target.value }))} required />
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '1180px', width: '96vw', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>{activeDocStudent.name} - Documents</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={activeDocTerm} onChange={e => setActiveDocTerm(e.target.value)} style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}>
                  {getTermNames(courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12.5px' }} onClick={() => window.print()}>
                  <Printer size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Print
                </button>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12.5px', background: '#0284c7', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={handleDownloadJpg} disabled={isDownloading}>
                  <Image size={14} /> {isDownloading ? 'Exporting...' : 'Download JPG'}
                </button>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12.5px', background: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={handleDownloadPdf} disabled={isDownloading}>
                  <FileDown size={14} /> {isDownloading ? 'Exporting...' : 'Download PDF'}
                </button>
                <button className="modal-close-btn" onClick={() => setActiveDocStudent(null)}><X size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button className={`doc-tab-btn ${activeDocTab === 'marksheet' ? 'active' : ''}`} onClick={() => setActiveDocTab('marksheet')}>Marksheet</button>
              <button className={`doc-tab-btn ${activeDocTab === 'admit' ? 'active' : ''}`} onClick={() => setActiveDocTab('admit')}>Admit Card</button>
              <button className={`doc-tab-btn ${activeDocTab === 'idcard' ? 'active' : ''}`} onClick={() => setActiveDocTab('idcard')}>Identity Card</button>
              <button className={`doc-tab-btn ${activeDocTab === 'result' ? 'active' : ''}`} onClick={() => setActiveDocTab('result')}>Online Result</button>
            </div>

            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'center', overflowX: 'auto' }} ref={docPreviewRef}>
              {activeDocTab === 'marksheet' && <MarksheetTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
              {activeDocTab === 'admit' && <AdmitCardTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
              {activeDocTab === 'idcard' && <IdCardTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
              {activeDocTab === 'result' && <OnlineResultTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
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
        {activeDocStudent && activeDocTab === 'marksheet' && <MarksheetTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
        {activeDocStudent && activeDocTab === 'admit' && <AdmitCardTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
        {activeDocStudent && activeDocTab === 'result' && <OnlineResultTemplate student={activeDocStudent} course={courses.find(c => c.name.toLowerCase() === activeDocStudent.course.toLowerCase())} termName={activeDocTerm} />}
        {portalStudent && portalActiveTab === 'marksheet' && <MarksheetTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
        {portalStudent && portalActiveTab === 'admit' && <AdmitCardTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
        {portalStudent && portalActiveTab === 'result' && <OnlineResultTemplate student={portalStudent} course={portalCourse} termName={portalActiveTerm} />}
      </div>

    </div>
  );
}
