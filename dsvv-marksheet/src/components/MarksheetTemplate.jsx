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

const numberToWords = (num) => {
  const ones = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN'];
  const tens = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY'];
  if (num === 0) return 'ZERO';
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? '-' + ones[n%10] : '');
    if (n < 1000) return ones[Math.floor(n/100)] + ' HUNDRED' + (n%100 ? ' AND ' + convert(n%100) : '');
    if (n < 100000) return convert(Math.floor(n/1000)) + ' THOUSAND' + (n%1000 ? ' ' + convert(n%1000) : '');
    if (n < 10000000) return convert(Math.floor(n/100000)) + ' LAKH' + (n%100000 ? ' ' + convert(n%100000) : '');
    return convert(Math.floor(n/10000000)) + ' CRORE' + (n%10000000 ? ' ' + convert(n%10000000) : '');
  };
  return convert(Math.floor(num));
};

export default function MarksheetTemplate({ student, course, termName }) {
  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  if (!student || !course || !termName) return null;

  const marksheet = student.marksheets?.[termName] || { dmcNo: '', issueDate: '', marks: {} };
  const subjects = course.terms?.[termName] || [];
  const marks = marksheet.marks || {};

  let totalMax = 0, totalMin = 0, totalObtained = 0;
  let allEntered = true, hasFailed = false;
  subjects.forEach(sub => {
    const ob = marks[sub.code];
    totalMax += sub.maxMarks;
    totalMin += sub.minMarks;
    if (ob !== undefined && ob !== '') {
      const v = parseInt(ob) || 0;
      totalObtained += v;
      if (v < sub.minMarks) hasFailed = true;
    } else { allEntered = false; }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';
  const cgpa = subjects.length > 0 ? (subjects.reduce((sum, sub) => {
    const ob = parseInt(marks[sub.code]) || 0;
    return sum + getGP(ob, sub.maxMarks);
  }, 0) / subjects.length).toFixed(2) : '0.00';

  let result = 'PENDING', division = '—';
  if (allEntered && subjects.length > 0) {
    if (hasFailed || parseFloat(percentage) < 33) result = 'FAIL';
    else {
      result = 'PASS';
      const pct = parseFloat(percentage);
      if (pct >= 60) division = 'FIRST DIVISION';
      else if (pct >= 45) division = 'SECOND DIVISION';
      else if (pct >= 33) division = 'THIRD DIVISION';
      else result = 'FAIL';
    }
  }

  const padded = [...subjects];
  while (padded.length < 8) padded.push(null);

  const qrData = `Name: ${student.name}\nFather: ${student.fatherName}\nMother: ${student.motherName}\nDOB: ${student.dob}\nEnrollment: ${student.enrollmentNo}\nCourse: ${student.course}\nSession: ${student.session}\nTerm: ${termName}\nResult: ${result}\nPercentage: ${percentage}%\nCGPA: ${cgpa}`;

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrData, { width: 70, margin: 1, color: { dark: '#000', light: '#fff' } }, err => { if (err) console.error(err); });
    }
    if (barcodeRef.current && student.enrollmentNo) {
      try { JsBarcode(barcodeRef.current, student.enrollmentNo, { format: 'CODE128', width: 1, height: 30, displayValue: false, margin: 0 }); } catch {}
    }
  }, [student, termName, result, percentage, cgpa]);

  return (
    <div className="print-container marksheet-landscape">
      <img src="/sample.jpg" alt="Border" className="marksheet-bg" />
      <div className="marksheet-overlay">
        {/* Header */}
        <div className="ms-header">
          <div className="dmc-no">DMC: {marksheet.dmcNo}</div>
          <img src="/brand-logo.png" alt="Logo" className="ms-logo" />
          <h1 className="ms-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
          <p className="ms-loc">RAIPUR, CHHATTISGARH</p>
          <div className="ms-badge">STATEMENT OF MARKS</div>
        </div>

        {/* Student Info */}
        <table className="ms-info-table">
          <tbody>
            <tr>
              <td className="ms-lbl">STUDENT NAME:</td>
              <td className="ms-val" colSpan={3}>{student.name}</td>
              <td className="ms-photo-cell" rowSpan={3}>
                {student.photo ? <img src={student.photo} alt="" className="ms-photo" /> : <div className="ms-no-photo">PHOTO</div>}
              </td>
            </tr>
            <tr>
              <td className="ms-lbl">FATHER NAME:</td>
              <td className="ms-val" colSpan={3}>{student.fatherName}</td>
            </tr>
            <tr>
              <td className="ms-lbl">MOTHER NAME:</td>
              <td className="ms-val" colSpan={3}>{student.motherName}</td>
            </tr>
            <tr>
              <td className="ms-lbl">ROLL NO:</td>
              <td className="ms-val"><strong>{student.rollNo}</strong></td>
              <td className="ms-lbl">ENROLLMENT NO:</td>
              <td className="ms-val"><strong>{student.enrollmentNo}</strong></td>
              <td rowSpan={3}></td>
            </tr>
            <tr>
              <td className="ms-lbl">COURSE:</td>
              <td className="ms-val" colSpan={2}>{student.course}</td>
              <td className="ms-lbl">SEMESTER/YEAR:</td>
            </tr>
            <tr>
              <td className="ms-lbl">SESSION:</td>
              <td className="ms-val" colSpan={2}>{student.session}</td>
              <td className="ms-lbl">DATE OF BIRTH:</td>
              <td className="ms-val">{student.dob}</td>
            </tr>
          </tbody>
        </table>

        {/* Marks Table */}
        <table className="ms-marks-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>SUB CODE</th>
              <th style={{ width: '48%', textAlign: 'left' }}>SUBJECT TITLE</th>
              <th style={{ width: '10%' }}>MAX MARKS</th>
              <th style={{ width: '10%' }}>MIN MARKS</th>
              <th style={{ width: '10%' }}>OBTAINED</th>
            </tr>
          </thead>
          <tbody>
            {padded.map((sub, i) => sub ? (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{sub.code}</td>
                <td style={{ textAlign: 'left' }}>{sub.name}</td>
                <td style={{ textAlign: 'center' }}>{sub.maxMarks}</td>
                <td style={{ textAlign: 'center' }}>{sub.minMarks}</td>
                <td style={{ textAlign: 'center', fontWeight: '600' }}>{marks[sub.code] !== undefined && marks[sub.code] !== '' ? marks[sub.code] : '—'}</td>
              </tr>
            ) : <tr key={i}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>)}
          </tbody>
        </table>

        {/* Summary */}
        <table className="ms-summary">
          <tbody>
            <tr>
              <td className="ms-lbl" style={{ width: '20%' }}>GRAND TOTAL:</td>
              <td className="ms-val" style={{ width: '20%' }}>{totalObtained} / {totalMax}</td>
              <td className="ms-lbl" style={{ width: '20%' }}>PERCENTAGE:</td>
              <td className="ms-val" style={{ width: '20%' }}>{percentage}%</td>
            </tr>
            <tr>
              <td className="ms-lbl">CGPA (on 10-point scale):</td>
              <td className="ms-val" style={{ fontWeight: '700', fontSize: '13pt' }}>{cgpa}</td>
              <td className="ms-lbl">RESULT:</td>
              <td className="ms-val" style={{ fontWeight: '700', color: result === 'FAIL' ? '#d32f2f' : '#2e7d32' }}>{result}</td>
            </tr>
            <tr>
              <td className="ms-lbl">DIVISION:</td>
              <td className="ms-val" style={{ fontWeight: '600' }}>{division}</td>
              <td className="ms-lbl">TOTAL IN WORDS:</td>
              <td className="ms-val" colSpan={1} style={{ fontSize: '9pt' }}>{totalObtained > 0 ? numberToWords(totalObtained) + ' ONLY' : '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="ms-footer">
          <div className="ms-footer-left">
            <svg ref={barcodeRef} style={{ width: '40mm', height: '8mm' }}></svg>
            <div style={{ fontSize: '8pt', fontWeight: 'bold' }}>DATE OF ISSUE: {marksheet.issueDate}</div>
          </div>
          <div className="ms-footer-center">
            <canvas ref={qrRef} style={{ width: '16mm', height: '16mm' }}></canvas>
          </div>
          <div className="ms-footer-right">
            <div className="ms-sig-area">
              <img src="/Signature.png" alt="" style={{ height: '8mm', objectFit: 'contain' }} />
              <div style={{ width: '100%', borderTop: '1px solid #000', marginTop: '1mm' }}></div>
              <div style={{ fontSize: '7pt', fontWeight: 'bold', marginTop: '1mm' }}>CONTROLLER OF EXAMINATIONS</div>
            </div>
            <img src="/Monogram.png" alt="" style={{ width: '14mm', height: '14mm', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .marksheet-landscape {
          width: 297mm; height: 210mm; position: relative; background: #fff; color: #000;
          font-family: Arial, sans-serif; box-sizing: border-box; overflow: hidden;
        }
        .marksheet-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
        .marksheet-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;
          padding: 12mm 16mm; display: flex; flex-direction: column; box-sizing: border-box;
        }
        .ms-header {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          margin-bottom: 3mm; border-bottom: 2px solid #000; padding-bottom: 2mm; position: relative;
        }
        .dmc-no { position: absolute; top: -3mm; right: 4mm; font-size: 8pt; font-weight: bold; font-family: monospace; }
        .ms-logo { height: 10mm; object-fit: contain; margin-bottom: 1mm; max-width: 80mm; }
        .ms-title { font-size: 16pt; font-weight: 800; color: #0d2149; margin: 0; line-height: 1.1; letter-spacing: 0.5px; }
        .ms-loc { font-size: 8pt; font-weight: bold; color: #333; margin: 0.5mm 0 1mm 0; letter-spacing: 1.5px; }
        .ms-badge {
          display: inline-block; background: #0d2149; color: #fff; font-size: 8pt; font-weight: bold;
          padding: 0.8mm 3mm; letter-spacing: 2px; border-radius: 2px;
        }
        .ms-info-table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; font-size: 8pt; }
        .ms-info-table td { padding: 1mm 1.5mm; vertical-align: middle; border: 1px solid #ddd; }
        .ms-lbl { font-weight: bold; color: #333; background: #f5f5f5; width: 14%; }
        .ms-val { color: #000; }
        .ms-photo-cell { width: 20mm; text-align: center; padding: 0.5mm !important; background: #fff !important; }
        .ms-photo { width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #333; display: block; margin: 0 auto; }
        .ms-no-photo { width: 18mm; height: 22mm; border: 1px dashed #666; display: flex; align-items: center; justify-content: center; font-size: 6pt; color: #666; margin: 0 auto; }
        .ms-marks-table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; font-size: 8pt; }
        .ms-marks-table th { background: #0d2149; color: #fff; font-weight: bold; padding: 1.5mm 1.5mm; border: 1px solid #000; font-size: 7.5pt; }
        .ms-marks-table td { padding: 1.2mm 1.5mm; border: 1px solid #000; text-align: center; }
        .ms-summary { width: 100%; border-collapse: collapse; margin-bottom: 4mm; font-size: 8pt; }
        .ms-summary td { padding: 1.5mm 2mm; border: 1px solid #000; }
        .ms-footer {
          margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end;
          border-top: 1px dashed #000; padding-top: 2mm;
        }
        .ms-footer-left { display: flex; flex-direction: column; gap: 1mm; }
        .ms-footer-center { display: flex; justify-content: center; }
        .ms-footer-right { display: flex; align-items: flex-end; gap: 3mm; }
        .ms-sig-area { display: flex; flex-direction: column; align-items: center; width: 40mm; }
      ` }} />
    </div>
  );
}
