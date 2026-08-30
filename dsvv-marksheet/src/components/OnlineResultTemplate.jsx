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
    <div className="online-result-container" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '750px', margin: '0 auto', padding: '20px', width: '100%' }}>
      <div style={{ background: 'linear-gradient(135deg, #0d2149, #1a3a6e)', color: '#ffffff', padding: '22px 20px', borderRadius: '12px 12px 0 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src="Dev_Sanskriti_Vishwavidyalaya Logo2.png" alt="DSVV Logo" style={{ height: '60px', marginBottom: '8px', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }} />
        <h2 style={{ margin: 0, fontSize: '19px', letterSpacing: '1px', color: '#ffffff', fontWeight: '800', textAlign: 'center' }}>DEV SANSKRITI VISHWAVIDYALAYA</h2>
        <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#e2e8f0', textAlign: 'center' }}>DURG / RAIPUR, CHHATTISGARH</p>
        <div style={{ marginTop: '10px', display: 'inline-block', background: '#D4AF37', color: '#0d2149', padding: '4px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px', textAlign: 'center' }}>ONLINE RESULT</div>
      </div>

      <div style={{ background: '#fff', padding: '20px', border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
          <div><strong>Name:</strong> {student.name}</div>
          <div><strong>Father:</strong> {student.fatherName}</div>
          <div><strong>Mother:</strong> {student.motherName}</div>
          <div><strong>DOB:</strong> {student.dob}</div>
          <div><strong>Roll No:</strong> {student.rollNo}</div>
          <div><strong>Enrollment:</strong> {student.enrollmentNo}</div>
          <div><strong>Course:</strong> {student.course}</div>
          <div><strong>Session:</strong> {student.session}</div>
          <div><strong>Term:</strong> {termName}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#0d2149', color: '#fff' }}>
              <th style={{ padding: '8px', border: '1px solid #000' }}>Code</th>
              <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '8px', border: '1px solid #000' }}>Max</th>
              <th style={{ padding: '8px', border: '1px solid #000' }}>Obtained</th>
              <th style={{ padding: '8px', border: '1px solid #000' }}>GP</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => {
              const ob = marks[sub.code];
              const gp = ob !== undefined && ob !== '' ? getGP(parseInt(ob) || 0, sub.maxMarks || 100) : '—';
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'center' }}>{sub.code}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{sub.name}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'center' }}>{sub.maxMarks || 100}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{ob !== undefined ? ob : '—'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'center' }}>{gp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '6px', textAlign: 'center', marginBottom: '16px' }}>
          <div><div style={{ fontSize: '11px', color: '#64748b' }}>TOTAL MARKS</div><div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d2149' }}>{totalObtained} / {totalMax}</div></div>
          <div><div style={{ fontSize: '11px', color: '#64748b' }}>PERCENTAGE</div><div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0d2149' }}>{percentage}%</div></div>
          <div><div style={{ fontSize: '11px', color: '#64748b' }}>RESULT / DIVISION</div><div style={{ fontSize: '14px', fontWeight: 'bold', color: result === 'PASS' ? '#10b981' : '#dc2626' }}>{result} ({division})</div></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <canvas ref={qrRef} />
          <canvas ref={barcodeRef} />
        </div>
      </div>
    </div>
  );
}
