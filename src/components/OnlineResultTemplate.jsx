import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function OnlineResultTemplate({ student, course, termName }) {
  const qrRef = useRef(null);
  const marksheet = student.marksheets[termName] || { dmcNo: '', issueDate: '', marks: {} };
  const subjects = (course && course.terms && course.terms[termName]) ? course.terms[termName] : [];

  // Calculate stats
  let totalMax = 0;
  let totalMin = 0;
  let totalObtained = 0;
  let hasFailedSubject = false;
  let allSubjectsEntered = true;

  subjects.forEach(sub => {
    const ob = marksheet.marks[sub.code];
    totalMax += sub.maxMarks;
    totalMin += sub.minMarks;
    if (ob !== undefined && ob !== '') {
      const marksNum = parseInt(ob) || 0;
      totalObtained += marksNum;
      if (marksNum < sub.minMarks) {
        hasFailedSubject = true;
      }
    } else {
      allSubjectsEntered = false;
    }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';
  let division = '—';
  let overallResult = 'PENDING';

  if (allSubjectsEntered && subjects.length > 0) {
    if (hasFailedSubject) {
      overallResult = 'FAIL';
    } else {
      overallResult = 'PASS';
      const pct = parseFloat(percentage);
      if (pct >= 60) division = 'FIRST';
      else if (pct >= 45) division = 'SECOND';
      else if (pct >= 33) division = 'THIRD';
      else overallResult = 'FAIL';
    }
  }

  // Convert number to words helper
  const numberToWords = (num) => {
    const a = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    
    if (num === 0) return 'ZERO';
    
    let words = '';
    if (Math.floor(num / 100) > 0) {
      words += numberToWords(Math.floor(num / 100)) + ' HUNDRED ';
      num %= 100;
    }
    
    if (num > 0) {
      if (words !== '') words += 'AND ';
      if (num < 20) {
        words += a[num];
      } else {
        words += b[Math.floor(num / 10)];
        if (num % 10 > 0) {
          words += '-' + a[num % 10];
        }
      }
    }
    return words.trim();
  };

  useEffect(() => {
    if (qrRef.current) {
      const qrData = `DSVV Online Result\nStudent: ${student.name}\nRoll: ${student.rollNo}\nEnroll: ${student.enrollmentNo}\nCourse: ${student.course}\nTerm: ${termName}\nResult: ${overallResult}\nObtained: ${totalObtained}/${totalMax}`;
      QRCode.toCanvas(qrRef.current, qrData, {
        width: 85,
        margin: 1
      }, (err) => {
        if (err) console.error(err);
      });
    }
  }, [student, termName, overallResult, totalObtained, totalMax]);

  return (
    <div className="print-container online-result-layout">
      <div className="result-card">
        <div className="result-dmc-top-line">DMC : {marksheet.dmcNo}</div>
        {/* Main Branding Header */}
        <div className="result-header">
          <h1 className="result-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
          <p className="result-univ-loc">DURG, CHHATTISGARH</p>
          <div className="result-title-badge">ONLINE RESULT</div>
        </div>

        {/* Student Information Fields */}
        <div className="result-info-grid">
          <div className="info-item">
            <span className="info-lbl">Name of Student :</span>
            <span className="info-val">{student.name.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-lbl">Registration No. :</span>
            <span className="info-val"><strong>{student.enrollmentNo}</strong></span>
          </div>
          
          <div className="info-item">
            <span className="info-lbl">Father Name :</span>
            <span className="info-val">{student.fatherName.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-lbl">Roll No. :</span>
            <span className="info-val"><strong>{student.rollNo}</strong></span>
          </div>
          
          <div className="info-item">
            <span className="info-lbl">Mother Name :</span>
            <span className="info-val">{student.motherName.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-lbl">&nbsp;</span>
            <span className="info-val">&nbsp;</span>
          </div>
          
          <div className="info-item">
            <span className="info-lbl">Session :</span>
            <span className="info-val">{student.session.toUpperCase()}</span>
          </div>
          <div className="info-item">&nbsp;</div>
          
          <div className="info-item" style={{ gridColumn: 'span 2' }}>
            <span className="info-lbl" style={{ width: '19%' }}>Program :</span>
            <span className="info-val">{student.course.toUpperCase()}</span>
          </div>
        </div>

        {/* Marks Table */}
        <table className="result-table">
          <thead>
            <tr className="result-table-term-header">
              <th colSpan={5}>{termName}</th>
            </tr>
            <tr>
              <th style={{ width: '12%', borderRight: '1px solid #000' }}>Code</th>
              <th style={{ width: '50%', textAlign: 'left', borderRight: '1px solid #000' }}>Subject</th>
              <th style={{ width: '13%', borderRight: '1px solid #000' }}>Marks Obtained</th>
              <th style={{ width: '13%', borderRight: '1px solid #000' }}>Minimum Marks</th>
              <th style={{ width: '12%' }}>Maximum Marks</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((sub, idx) => {
                const obMark = marksheet.marks[sub.code];
                return (
                  <tr key={idx}>
                    <td style={{ borderRight: '1px solid #000' }}>{sub.code}</td>
                    <td style={{ textAlign: 'left', borderRight: '1px solid #000' }}>{sub.name.toUpperCase()}</td>
                    <td style={{ fontWeight: 'bold', borderRight: '1px solid #000' }}>
                      {obMark !== undefined && obMark !== '' ? obMark : '—'}
                    </td>
                    <td style={{ borderRight: '1px solid #000' }}>{sub.minMarks}</td>
                    <td>{sub.maxMarks}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5}>No subjects found</td>
              </tr>
            )}
            
            {/* Fill empty spacer rows */}
            {subjects.length > 0 && subjects.length < 6 && (
              Array.from({ length: 6 - subjects.length }).map((_, i) => (
                <tr key={`spacer-${i}`} className="result-spacer-row">
                  <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                  <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))
            )}
            
            {/* Result Summary Row */}
            <tr className="result-summary-row">
              <td colSpan={2} style={{ fontWeight: 'bold', borderRight: '1px solid #000' }}>Result</td>
              <td colSpan={3} style={{ fontWeight: 'bold', color: overallResult === 'PASS' ? '#1b5e20' : '#b71c1c' }}>
                {overallResult}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Lower Summary and QR Block */}
        <div className="result-lower-section">
          <div className="lower-summary-table-wrapper">
            <table className="lower-summary-table">
              <tbody>
                <tr>
                  <td className="sum-lbl" style={{ width: '35%' }}>Semester</td>
                  <td style={{ width: '20%' }}>{termName.split(' ')[0]}</td>
                  <td className="sum-lbl" style={{ width: '25%' }}>Grand Total</td>
                  <td style={{ width: '20%' }} className="sum-lbl">Division</td>
                </tr>
                <tr>
                  <td className="sum-lbl">Maximum Marks</td>
                  <td>{totalMax}</td>
                  <td rowSpan={2} style={{ fontSize: '12pt', fontWeight: 'bold', verticalAlign: 'middle' }}>
                    {totalObtained} / {totalMax}
                  </td>
                  <td rowSpan={2} style={{ fontSize: '11pt', fontWeight: 'bold', verticalAlign: 'middle', textTransform: 'uppercase' }}>
                    {division}
                  </td>
                </tr>
                <tr>
                  <td className="sum-lbl">Total Marks Obtained</td>
                  <td style={{ fontWeight: 'bold' }}>{totalObtained}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="result-words-block">
              <strong>Marks in Words: </strong>
              <span className="words-val">
                {totalObtained > 0 ? `${numberToWords(totalObtained)} ONLY` : '—'}
              </span>
            </div>
          </div>
          
          <div className="lower-qr-wrapper">
            <canvas ref={qrRef} className="result-qr-canvas"></canvas>
          </div>
        </div>

        {/* Footer with Monogram and Signature */}
        <div className="result-footer">
          <div className="result-footer-monogram-box">
            <img src="/DSVV-Logo.png" alt="DSVV Logo" className="result-footer-monogram" />
          </div>
          <div className="result-footer-signature-box">
            <img src="/Signature.png" alt="Controller Signature" className="result-footer-sig-img" />
            <div className="result-footer-sig-line"></div>
            <div className="result-footer-sig-title">CONTROLLER OF EXAMINATIONS</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .online-result-layout {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          background: #fff;
          color: #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }

        .result-card {
          border: 3px solid #000;
          padding: 8mm;
          background-color: #fff;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          position: relative;
        }

        .result-dmc-top-line {
          position: absolute;
          top: 3mm;
          right: 8mm;
          font-size: 10pt;
          font-weight: bold;
          color: #000;
          font-family: monospace;
        }

        .result-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 6mm;
          width: 100%;
        }

        .result-monogram {
          width: 18mm;
          height: 18mm;
          margin-bottom: 2mm;
        }

        .result-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 4mm;
          border-top: 1.5px solid #000;
        }

        .result-footer-monogram-box {
          display: flex;
          align-items: center;
        }

        .result-footer-monogram {
          width: 16mm;
          height: 16mm;
        }

        .result-footer-signature-box {
          text-align: center;
          width: 48mm;
          position: relative;
        }

        .result-footer-sig-img {
          height: 10mm;
          object-fit: contain;
          margin-bottom: 1.5mm;
        }

        .result-footer-sig-line {
          width: 100%;
          border-top: 1.5px solid #000;
          margin-bottom: 1.5mm;
        }

        .result-footer-sig-title {
          font-size: 7.5pt;
          font-weight: bold;
          color: #333;
          letter-spacing: 0.5px;
        }

        .result-univ-title {
          font-family: Arial, sans-serif;
          font-size: 21pt;
          font-weight: bold;
          color: #0d2149;
          margin: 0;
        }

        .result-univ-loc {
          font-size: 10.5pt;
          font-weight: bold;
          color: #10b981;
          margin: 1mm 0 3mm 0;
          letter-spacing: 0.5px;
        }

        .result-title-badge {
          font-size: 12pt;
          font-weight: bold;
          border-top: 1.5px solid #000;
          border-bottom: 1.5px solid #000;
          padding: 1mm 8mm;
          margin-top: 2mm;
          letter-spacing: 1px;
        }

        .result-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2mm;
          margin-bottom: 5mm;
          font-size: 9.5pt;
          padding-left: 2mm;
        }

        .info-item {
          display: flex;
          align-items: baseline;
        }

        .info-lbl {
          font-weight: bold;
          color: #222;
          width: 38%;
          flex-shrink: 0;
        }

        .info-val {
          color: #000;
        }

        .result-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #000;
          margin-bottom: 6mm;
          font-size: 9.5pt;
        }

        .result-table th, .result-table td {
          border-bottom: 1px solid #000;
          padding: 2.2mm 2.5mm;
          text-align: center;
        }

        .result-table-term-header th {
          font-size: 11pt;
          font-weight: bold;
          background-color: #fff;
          border-bottom: 2px solid #000;
          padding: 1.8mm;
        }

        .result-table th:not([colspan]) {
          font-weight: bold;
          background-color: #fff;
          border-bottom: 2px solid #000;
          font-size: 8.5pt;
        }

        .result-spacer-row td {
          padding: 2.2mm !important;
        }

        .result-summary-row {
          background-color: #f5f5f5;
        }

        .result-summary-row td {
          border-bottom: none;
          padding: 2.5mm;
        }

        .result-lower-section {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          gap: 4mm;
        }

        .lower-summary-table-wrapper {
          flex: 1;
        }

        .lower-summary-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000;
          font-size: 8.5pt;
          text-align: center;
        }

        .lower-summary-table td {
          border: 1px solid #000;
          padding: 1.8mm 1.5mm;
        }

        .sum-lbl {
          font-weight: bold;
          background-color: #fff;
        }

        .result-words-block {
          font-size: 9pt;
          margin-top: 3mm;
          text-transform: uppercase;
        }

        .words-val {
          font-size: 8.5pt;
          font-weight: 500;
        }

        .lower-qr-wrapper {
          width: 25mm;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }

        .result-qr-canvas {
          width: 22mm !important;
          height: 22mm !important;
          border: 1px solid #000;
        }
      ` }} />
    </div>
  );
}
