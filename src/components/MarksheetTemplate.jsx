import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export default function MarksheetTemplate({ student, course, termName }) {
  const qrRef = useRef(null);
  
  const marksheet = student.marksheets[termName] || { dmcNo: '', issueDate: '', marks: {} };
  const subjects = (course && course.terms && course.terms[termName]) ? course.terms[termName] : [];

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
      if (marksNum < sub.minMarks) hasFailedSubject = true;
    } else {
      allSubjectsEntered = false;
    }
  });

  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00';
  const cgpa = (parseFloat(percentage) / 10).toFixed(2);
  
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

  useEffect(() => {
    if (qrRef.current) {
      const qrData = `DSVV\n${student.name}\nRoll: ${student.rollNo}\nEnroll: ${student.enrollmentNo}\n${student.course}\n${termName}\nResult: ${overallResult}`;
      QRCode.toCanvas(qrRef.current, qrData, { width: 50, margin: 0, color: { dark: '#000', light: '#fff' } });
    }
  }, [student, termName, overallResult]);

  // Get all term names for year summary
  const allTerms = course && course.terms ? Object.keys(course.terms) : [];

  // Generate year data rows
  const yearRows = [];
  for (let i = 0; i < 4; i++) {
    const termName = allTerms[i];
    if (termName) {
      const total = getTotalForTerm(student, termName);
      const max = getMaxForTerm(course, termName);
      yearRows.push({ total, max });
    } else {
      yearRows.push({ total: '***', max: '***' });
    }
  }

  return (
    <div className="dsvv-official">
      <img src="/DSVV-Background.jpg" alt="" className="dsvv-official-bg" />
      
      <div className="dsvv-official-content">
        {/* Header */}
        <div className="dsvv-off-header">
          <img src="/DSVV-Logo.png" alt="DSVV" className="dsvv-off-logo" />
          <div className="dsvv-off-title-area">
            <div className="dsvv-off-uni-name">DEV SANSKRITI VISHWAVIDYALAYA, DURG, CHATTISGARH</div>
            <div className="dsvv-off-statement">STATEMENT OF MARKS</div>
          </div>
        </div>

        {/* Course & Exam */}
        <div className="dsvv-off-exam-row">
          <div className="dsvv-off-course-exam">
            <div className="dsvv-off-course">{student.course.toUpperCase()}</div>
            <div className="dsvv-off-exam">{termName.toUpperCase()} EXAMINATION</div>
          </div>
          <div className="dsvv-off-srno">Sr. No. : {marksheet.dmcNo}</div>
        </div>

        {/* Student Info */}
        <div className="dsvv-off-student">
          <div className="dsvv-off-stu-left">
            <div className="dsvv-off-stu-row">
              <span className="dsvv-off-stu-label">Name</span>
              <span className="dsvv-off-stu-col">:</span>
              <span className="dsvv-off-stu-val">{student.name.toUpperCase()}</span>
            </div>
            <div className="dsvv-off-stu-row">
              <span className="dsvv-off-stu-label">F/H Name</span>
              <span className="dsvv-off-stu-col">:</span>
              <span className="dsvv-off-stu-val">{student.fatherName.toUpperCase()}</span>
            </div>
            <div className="dsvv-off-stu-row">
              <span className="dsvv-off-stu-label">M's Name</span>
              <span className="dsvv-off-stu-col">:</span>
              <span className="dsvv-off-stu-val">{student.motherName.toUpperCase()}</span>
            </div>
          </div>
          <div className="dsvv-off-stu-right">
            <div className="dsvv-off-stu-row">
              <span className="dsvv-off-stu-label">Roll. No.</span>
              <span className="dsvv-off-stu-col">:</span>
              <span className="dsvv-off-stu-val">{student.rollNo}</span>
            </div>
            <div className="dsvv-off-stu-row">
              <span className="dsvv-off-stu-label">Enroll No.</span>
              <span className="dsvv-off-stu-col">:</span>
              <span className="dsvv-off-stu-val">{student.enrollmentNo}</span>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <table className="dsvv-off-table">
          <thead>
            <tr>
              <th className="dsvv-off-th-subject" rowSpan={2}>Subject</th>
              <th colSpan={3}>Maximum Marks</th>
              <th colSpan={3}>Minimum Marks</th>
              <th colSpan={3}>Marks Obtained</th>
              <th rowSpan={2}>Total</th>
            </tr>
            <tr>
              <th>Th</th><th>Pr</th><th>Asg</th>
              <th>Th</th><th>Pr</th><th>Asg</th>
              <th>Th</th><th>Pr</th><th>Asg</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, idx) => {
              const mark = marksheet.marks[sub.code];
              const obtained = mark !== undefined && mark !== '' ? parseInt(mark) || 0 : null;
              const maxTh = Math.round(sub.maxMarks * 0.7);
              const maxPr = Math.round(sub.maxMarks * 0.2);
              const maxAsg = sub.maxMarks - maxTh - maxPr;
              const minTh = Math.round(sub.minMarks * 0.7);
              const minPr = Math.round(sub.minMarks * 0.2);
              const minAsg = sub.minMarks - minTh - minPr;
              const obTh = obtained !== null ? Math.round(obtained * 0.7) : '';
              const obPr = obtained !== null ? Math.round(obtained * 0.2) : '';
              const obAsg = obtained !== null ? obtained - Math.round(obtained * 0.7) - Math.round(obtained * 0.2) : '';
              const isFail = obtained !== null && obtained < sub.minMarks;
              
              return (
                <tr key={idx}>
                  <td className="dsvv-off-td-subject">{sub.name.toUpperCase()}</td>
                  <td>{maxTh}</td><td>{maxPr}</td><td>{maxAsg}</td>
                  <td>{minTh}</td><td>{minPr}</td><td>{minAsg}</td>
                  <td className={isFail ? 'dsvv-off-fail' : ''}>{obTh}</td>
                  <td className={isFail ? 'dsvv-off-fail' : ''}>{obPr}</td>
                  <td className={isFail ? 'dsvv-off-fail' : ''}>{obAsg}</td>
                  <td className="dsvv-off-td-total">{obtained !== null ? obtained : ''}</td>
                </tr>
              );
            })}
            {/* Fill empty rows */}
            {subjects.length > 0 && subjects.length < 8 && 
              Array.from({ length: 8 - subjects.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="dsvv-off-empty-row"><td>&nbsp;</td>{Array(10).fill(null).map((_, j) => <td key={j}></td>)}</tr>
              ))
            }
            {/* Total Row */}
            <tr className="dsvv-off-total-row">
              <td className="dsvv-off-td-subject" style={{fontWeight:'bold'}}>Total</td>
              <td>{totalMax > 0 ? Math.round(totalMax * 0.7) : ''}</td>
              <td>{totalMax > 0 ? Math.round(totalMax * 0.2) : ''}</td>
              <td>{totalMax > 0 ? totalMax - Math.round(totalMax * 0.7) - Math.round(totalMax * 0.2) : ''}</td>
              <td>{totalMin > 0 ? Math.round(totalMin * 0.7) : ''}</td>
              <td>{totalMin > 0 ? Math.round(totalMin * 0.2) : ''}</td>
              <td>{totalMin > 0 ? totalMin - Math.round(totalMin * 0.7) - Math.round(totalMin * 0.2) : ''}</td>
              <td className="dsvv-off-bold">{totalObtained > 0 ? Math.round(totalObtained * 0.7) : ''}</td>
              <td className="dsvv-off-bold">{totalObtained > 0 ? Math.round(totalObtained * 0.2) : ''}</td>
              <td className="dsvv-off-bold">{totalObtained > 0 ? totalObtained - Math.round(totalObtained * 0.7) - Math.round(totalObtained * 0.2) : ''}</td>
              <td className="dsvv-off-td-total dsvv-off-bold">{totalObtained}</td>
            </tr>
          </tbody>
        </table>

        {/* Year Summary & Grand Total */}
        <div className="dsvv-off-summary">
          <div className="dsvv-off-year-box">
            <table className="dsvv-off-year-table">
              <tbody>
                <tr>
                  <td className="dsvv-off-marks-label" rowSpan={6}>M<br/>A<br/>R<br/>K<br/>S</td>
                  <td className="dsvv-off-year-header" colSpan={2}>1st YEAR</td>
                  <td className="dsvv-off-year-header" colSpan={2}>2nd YEAR</td>
                </tr>
                <tr>
                  <td className="dsvv-off-year-sub">Total</td>
                  <td className="dsvv-off-year-sub">Out of</td>
                  <td className="dsvv-off-year-sub">Total</td>
                  <td className="dsvv-off-year-sub">Out of</td>
                </tr>
                <tr>
                  <td className="dsvv-off-year-val">{yearRows[0].total}</td>
                  <td className="dsvv-off-year-val">{yearRows[0].max}</td>
                  <td className="dsvv-off-year-val">{yearRows[1].total}</td>
                  <td className="dsvv-off-year-val">{yearRows[1].max}</td>
                </tr>
                <tr>
                  <td className="dsvv-off-year-header" colSpan={2}>3rd YEAR</td>
                  <td className="dsvv-off-year-header" colSpan={2}>4th YEAR</td>
                </tr>
                <tr>
                  <td className="dsvv-off-year-sub">Total</td>
                  <td className="dsvv-off-year-sub">Out of</td>
                  <td className="dsvv-off-year-sub">Total</td>
                  <td className="dsvv-off-year-sub">Out of</td>
                </tr>
                <tr>
                  <td className="dsvv-off-year-val">{yearRows[2].total}</td>
                  <td className="dsvv-off-year-val">{yearRows[2].max}</td>
                  <td className="dsvv-off-year-val">{yearRows[3].total}</td>
                  <td className="dsvv-off-year-val">{yearRows[3].max}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="dsvv-off-grand-box">
            <div className="dsvv-off-grand-row dsvv-off-grand-header-row">
              <div className="dsvv-off-grand-cell">GRAND TOTAL</div>
              <div className="dsvv-off-grand-cell">RESULT</div>
              <div className="dsvv-off-grand-cell">DIVISION</div>
            </div>
            <div className="dsvv-off-grand-row dsvv-off-grand-label-row">
              <div className="dsvv-off-grand-cell">Total</div>
              <div className="dsvv-off-grand-cell">Out of</div>
              <div className="dsvv-off-grand-cell"></div>
              <div className="dsvv-off-grand-cell"></div>
            </div>
            <div className="dsvv-off-grand-row dsvv-off-grand-val-row">
              <div className="dsvv-off-grand-cell dsvv-off-grand-num">{totalObtained}</div>
              <div className="dsvv-off-grand-cell dsvv-off-grand-num">{totalMax}</div>
              <div className="dsvv-off-grand-cell dsvv-off-result">{overallResult}</div>
              <div className="dsvv-off-grand-cell dsvv-off-div">{division}</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="dsvv-off-legend">
          <div>C = CARRY FORWARD</div>
          <div>* = FAIL IN SUBJECT</div>
          <div>G = PASS BY GRACE</div>
          <div>ABS = ABSENT</div>
        </div>

        {/* Footer */}
        <div className="dsvv-off-footer">
          <div className="dsvv-off-footer-left">
            Date of Issue <strong>{marksheet.issueDate}</strong>
          </div>
          <div className="dsvv-off-footer-center">
            Seal
          </div>
          <div className="dsvv-off-footer-right">
            <img src="/Signature.png" alt="Signature" className="dsvv-off-sig" />
            <div className="dsvv-off-sig-title">Registrar</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dsvv-official {
          width: 297mm;
          height: 210mm;
          position: relative;
          background: #fff;
          font-family: 'Times New Roman', Times, serif;
          overflow: hidden;
        }
        .dsvv-official-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 1;
        }
        .dsvv-official-content {
          position: relative;
          z-index: 5;
          width: 100%; height: 100%;
          padding: 6mm 10mm 5mm 10mm;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* Header */
        .dsvv-off-header {
          display: flex;
          align-items: center;
          gap: 3mm;
          margin-bottom: 1mm;
        }
        .dsvv-off-logo {
          width: 24mm;
          height: 24mm;
          object-fit: contain;
          flex-shrink: 0;
        }
        .dsvv-off-title-area {
          flex: 1;
          text-align: center;
        }
        .dsvv-off-uni-name {
          font-size: 18pt;
          font-weight: 700;
          color: #1565c0;
          letter-spacing: 1px;
          line-height: 1.2;
        }
        .dsvv-off-statement {
          font-size: 11pt;
          font-weight: 700;
          color: #c62828;
          letter-spacing: 3px;
          margin-top: 1mm;
        }

        /* Course & Exam */
        .dsvv-off-exam-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2mm;
        }
        .dsvv-off-course {
          font-size: 11pt;
          font-weight: 700;
          color: #1a1a1a;
        }
        .dsvv-off-exam {
          font-size: 9.5pt;
          font-weight: 600;
          color: #333;
        }
        .dsvv-off-srno {
          font-size: 8pt;
          color: #333;
          text-align: right;
        }

        /* Student Info */
        .dsvv-off-student {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3mm;
          font-size: 9pt;
        }
        .dsvv-off-stu-left, .dsvv-off-stu-right {
          display: flex;
          flex-direction: column;
          gap: 1mm;
        }
        .dsvv-off-stu-row {
          display: flex;
          gap: 1mm;
        }
        .dsvv-off-stu-label {
          min-width: 22mm;
          font-weight: 600;
          color: #333;
        }
        .dsvv-off-stu-col { color: #333; }
        .dsvv-off-stu-val { color: #1a1a1a; }

        /* Marks Table */
        .dsvv-off-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
          margin-bottom: 2mm;
          border: 1.5px solid #333;
        }
        .dsvv-off-table th,
        .dsvv-off-table td {
          border: 1px solid #555;
          padding: 1.5mm 2mm;
          text-align: center;
        }
        .dsvv-off-table th {
          background: #e3ebf5;
          font-weight: 700;
          font-size: 7.5pt;
        }
        .dsvv-off-th-subject {
          width: 28%;
          text-align: left !important;
        }
        .dsvv-off-td-subject {
          text-align: left !important;
          padding-left: 3mm !important;
        }
        .dsvv-off-td-total {
          font-weight: 700;
          background: #f0f0f0;
        }
        .dsvv-off-fail { color: #c62828; font-weight: 700; }
        .dsvv-off-bold { font-weight: 700; }
        .dsvv-off-empty-row td { border-color: #ccc; }
        .dsvv-off-total-row td {
          border-top: 2px solid #333;
          background: #e8e8e8;
        }

        /* Year Summary */
        .dsvv-off-summary {
          display: flex;
          gap: 2mm;
          margin-bottom: 2mm;
        }
        .dsvv-off-year-box {
          flex: 1;
        }
        .dsvv-off-year-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
          border: 1.5px solid #333;
        }
        .dsvv-off-year-table td {
          border: 1px solid #555;
          padding: 1.2mm 2mm;
          text-align: center;
        }
        .dsvv-off-marks-label {
          background: #1565c0;
          color: #fff;
          font-weight: 700;
          font-size: 8pt;
          writing-mode: vertical-lr;
          text-orientation: upright;
          letter-spacing: 2px;
          width: 8mm;
          padding: 2mm 1mm;
        }
        .dsvv-off-year-header {
          background: #2196f3;
          color: #fff;
          font-weight: 700;
          font-size: 8pt;
        }
        .dsvv-off-year-sub {
          background: #e3ebf5;
          font-weight: 600;
          font-size: 7pt;
        }
        .dsvv-off-year-val {
          font-weight: 700;
          font-size: 9pt;
        }

        /* Grand Total */
        .dsvv-off-grand-box {
          flex: 0.6;
          border: 1.5px solid #333;
        }
        .dsvv-off-grand-row {
          display: flex;
        }
        .dsvv-off-grand-header-row {
          background: #1565c0;
        }
        .dsvv-off-grand-header-row .dsvv-off-grand-cell {
          color: #fff;
          font-weight: 700;
          font-size: 8pt;
          padding: 1.5mm 2mm;
          text-align: center;
          flex: 1;
          border-right: 1px solid rgba(255,255,255,0.3);
        }
        .dsvv-off-grand-header-row .dsvv-off-grand-cell:last-child {
          border-right: none;
        }
        .dsvv-off-grand-label-row {
          background: #e3ebf5;
        }
        .dsvv-off-grand-label-row .dsvv-off-grand-cell {
          font-weight: 600;
          font-size: 7pt;
          padding: 1mm 2mm;
          text-align: center;
          flex: 1;
          border-right: 1px solid #999;
          border-bottom: 1px solid #999;
        }
        .dsvv-off-grand-label-row .dsvv-off-grand-cell:last-child {
          border-right: none;
        }
        .dsvv-off-grand-val-row .dsvv-off-grand-cell {
          padding: 2mm 2mm;
          text-align: center;
          flex: 1;
          border-right: 1px solid #999;
          border-bottom: 1px solid #999;
        }
        .dsvv-off-grand-val-row .dsvv-off-grand-cell:last-child {
          border-right: none;
        }
        .dsvv-off-grand-num {
          font-size: 14pt;
          font-weight: 700;
          color: #1a1a1a;
        }
        .dsvv-off-result {
          font-size: 11pt;
          font-weight: 700;
          color: #2e7d32;
        }
        .dsvv-off-div {
          font-size: 11pt;
          font-weight: 700;
          color: #1565c0;
        }

        /* Legend */
        .dsvv-off-legend {
          font-size: 7.5pt;
          color: #333;
          margin-bottom: 2mm;
          line-height: 1.7;
        }

        /* Footer */
        .dsvv-off-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9pt;
          margin-top: auto;
          padding-top: 2mm;
        }
        .dsvv-off-footer-left { color: #333; }
        .dsvv-off-footer-center { color: #333; }
        .dsvv-off-footer-right {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dsvv-off-sig {
          height: 12mm;
          object-fit: contain;
        }
        .dsvv-off-sig-title {
          font-size: 7.5pt;
          font-weight: 600;
          color: #333;
        }
      `}} />
    </div>
  );
}

function getTotalForTerm(student, termName) {
  const ms = student.marksheets[termName];
  if (!ms || !ms.marks) return '***';
  const marks = Object.values(ms.marks);
  if (marks.length === 0) return '***';
  return marks.reduce((sum, m) => sum + (parseInt(m) || 0), 0);
}

function getMaxForTerm(course, termName) {
  if (!course || !course.terms || !course.terms[termName]) return '***';
  return course.terms[termName].reduce((sum, s) => sum + (s.maxMarks || 0), 0);
}
