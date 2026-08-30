import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

const gradePoints = [
  { min: 90, gp: 10 }, { min: 80, gp: 9 }, { min: 70, gp: 8 },
  { min: 60, gp: 7 }, { min: 55, gp: 6 }, { min: 50, gp: 5 },
  { min: 45, gp: 4 }, { min: 40, gp: 3 }, { min: 0, gp: 0 }
];

const getGP = (marks, max) => {
  const pct = max > 0 ? (marks / max) * 100 : 0;
  for (const g of gradePoints) { if (pct >= g.min) return g.gp; }
  return 0;
};

export default function OnlineResultTemplate({ student, course, termName }) {
  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  if (!student || !course || !termName) return null;

  const marksheet = student.marksheets?.[termName] || { marks: {} };
  const subjects = course.terms?.[termName] || [];
  const marks = marksheet.marks || {};

  let totalMax = 0, totalObtained = 0;
  let allEntered = true, hasFailed = false;
  subjects.forEach(sub => {
    const ob = marks[sub.code];
    totalMax += (sub.maxMarks || 100);
    if (ob !== undefined && ob !== '') {
      const v = parseInt(ob) || 0;
      totalObtained += v;
      if (v < (sub.minMarks || 40)) hasFailed = true;
    } else { allEntered = false; }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';
  const cgpa = subjects.length > 0 ? (subjects.reduce((sum, sub) => sum + getGP(parseInt(marks[sub.code]) || 0, sub.maxMarks || 100), 0) / subjects.length).toFixed(2) : '0.00';
  let result = 'PENDING';
  if (allEntered && subjects.length > 0) result = hasFailed || parseFloat(percentage) < 33 ? 'FAIL' : 'PASS';
  let division = '—';
  if (result === 'PASS') {
    const pct = parseFloat(percentage);
    if (pct >= 60) division = 'FIRST DIVISION';
    else if (pct >= 45) division = 'SECOND DIVISION';
    else if (pct >= 33) division = 'THIRD DIVISION';
  }

  const qrData = `Name: ${student.name}\nCourse: ${student.course}\nSession: ${student.session}\nTerm: ${termName}\nResult: ${result}\nCGPA: ${cgpa}`;

  useEffect(() => {
    if (qrRef.current) QRCode.toCanvas(qrRef.current, qrData, { width: 60, margin: 1 });
    if (barcodeRef.current && student.enrollmentNo) {
      try { JsBarcode(barcodeRef.current, student.enrollmentNo, { format: 'CODE128', width: 1, height: 25, displayValue: false, margin: 0 }); } catch {}
    }
  }, [student, termName, result, cgpa]);

  return (
    <div className="online-result-container" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '750px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', boxShadow: '0 12px 35px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d2149, #1e3a8a)', color: '#ffffff', padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src="Dev_Sanskriti_Vishwavidyalaya Logo2.png" alt="DSVV Logo" style={{ height: '58px', marginBottom: '8px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
        <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.8px', color: '#ffffff', fontWeight: '800', textAlign: 'center' }}>DEV SANSKRITI VISHWAVIDYALAYA</h2>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1', letterSpacing: '0.5px', textAlign: 'center' }}>DURG / RAIPUR, CHHATTISGARH</p>
        <div style={{ marginTop: '10px', display: 'inline-block', background: '#d4af37', color: '#0d2149', padding: '4px 18px', borderRadius: '4px', fontWeight: '800', fontSize: '11.5px', letterSpacing: '1.5px', textAlign: 'center' }}>ONLINE STATEMENT OF MARKS</div>
      </div>

      {/* Profile Details */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '12.5px', background: '#f8fafc', padding: '14px 18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Student Name:</span> <strong style={{ color: '#0d2149', fontSize: '13.5px' }}>{student.name}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Roll No:</span> <strong style={{ color: '#0d2149' }}>{student.rollNo}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Father's Name:</span> <strong style={{ color: '#1e293b' }}>{student.fatherName}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Enrollment No:</span> <strong style={{ color: '#0d2149' }}>{student.enrollmentNo}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Mother's Name:</span> <strong style={{ color: '#1e293b' }}>{student.motherName}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Date of Birth:</span> <strong style={{ color: '#1e293b' }}>{student.dob}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Course:</span> <strong style={{ color: '#0d2149' }}>{student.course}</strong></div>
          <div><span style={{ color: '#64748b', fontWeight: '600' }}>Session / Term:</span> <strong style={{ color: '#1e293b' }}>{student.session} ({termName})</strong></div>
        </div>

        {/* Subjects Score Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
          <thead>
            <tr style={{ background: '#0d2149', color: '#ffffff' }}>
              <th style={{ padding: '10px 8px', border: '1px solid #1e293b', textAlign: 'center', width: '15%' }}>Subject Code</th>
              <th style={{ padding: '10px 12px', border: '1px solid #1e293b', textAlign: 'left' }}>Subject Title</th>
              <th style={{ padding: '10px 8px', border: '1px solid #1e293b', textAlign: 'center', width: '14%' }}>Max Marks</th>
              <th style={{ padding: '10px 8px', border: '1px solid #1e293b', textAlign: 'center', width: '16%' }}>Marks Obtained</th>
              <th style={{ padding: '10px 8px', border: '1px solid #1e293b', textAlign: 'center', width: '12%' }}>Grade Point</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => {
              const ob = marks[sub.code];
              const gp = ob !== undefined && ob !== '' ? getGP(parseInt(ob) || 0, sub.maxMarks || 100) : '—';
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: '600', color: '#475569' }}>{sub.code}</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '500' }}>{sub.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#475569' }}>{sub.maxMarks || 100}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: '700', color: '#0d2149' }}>{ob !== undefined ? ob : '—'}</td>
                  <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: '600', color: '#334155' }}>{gp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Results Summary Box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f1f5f9', padding: '14px 18px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL MARKS</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0d2149', marginTop: '2px' }}>{totalObtained} / {totalMax}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PERCENTAGE</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0d2149', marginTop: '2px' }}>{percentage}%</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RESULT / DIVISION</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: result === 'PASS' ? '#16a34a' : '#dc2626', marginTop: '3px' }}>
              {result} {division !== '—' ? `(${division})` : ''}
            </div>
          </div>
        </div>

        {/* Footer Bar: QR and Barcode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <canvas ref={qrRef} style={{ width: '48px', height: '48px', display: 'block' }} />
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              <div style={{ fontWeight: '700', color: '#0d2149' }}>DIGITALLY VERIFIED</div>
              <div>Official Academic Record</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <canvas ref={barcodeRef} style={{ height: '22px', display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
