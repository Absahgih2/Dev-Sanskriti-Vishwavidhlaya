import React from 'react';

export default function AdmitCardTemplate({ student, course, termName }) {
  const marksheet = student.marksheets[termName] || { issueDate: '' };
  const subjects = (course && course.terms && course.terms[termName]) ? course.terms[termName] : [];

  // Generate mock exam dates based on the marksheet issue date (or general date)
  // Let's assume exams start 30 days before issueDate and run on consecutive weekdays
  const getExamDate = (issueDateStr, index) => {
    try {
      if (!issueDateStr) return 'TBA';
      const [dd, mm, yyyy] = issueDateStr.split('-').map(Number);
      
      // Extract session start year to clamp dates properly to enrollment range
      const sessionStr = student.session;
      const years = sessionStr.match(/\b(20\d{2})\b/g);
      const startYear = years ? parseInt(years[0]) : yyyy;
      
      const examYear = Math.max(startYear, yyyy);
      const date = new Date(examYear, mm - 1, dd);
      
      // Start exams 30 days before marksheet issue date
      date.setDate(date.getDate() - 30);
      
      // Add index days, skipping Sundays
      let count = 0;
      while (count < index) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0) { // Not Sunday
          count++;
        }
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}-${month}-${date.getFullYear()}`;
    } catch (e) {
      return 'TBA';
    }
  };

  return (
    <div className="print-container admit-card-layout">
      <div className="admit-card-border">
        {/* Header (Side-by-side: Logo on left, titles on right) */}
        <div className="admit-header">
          <img src="/DSVV-Logo.png" alt="DSVV Logo" className="admit-logo" />
          <div className="admit-header-titles">
            <h1 className="admit-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h1>
            <p className="admit-univ-loc">DURG, CHHATTISGARH</p>
            <div className="admit-badge">ADMIT CARD</div>
          </div>
        </div>

        {/* Student Details and Photo Row */}
        <div className="admit-details-row">
          <div className="admit-details-col">
            <table className="admit-details-table">
              <tbody>
                <tr>
                  <td className="admit-lbl">STUDENT NAME:</td>
                  <td className="admit-val"><strong>{student.name.toUpperCase()}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">FATHER NAME:</td>
                  <td className="admit-val">{student.fatherName.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">MOTHER NAME:</td>
                  <td className="admit-val">{student.motherName.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">ROLL NO:</td>
                  <td className="admit-val"><strong>{student.rollNo}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">ENROLLMENT NO:</td>
                  <td className="admit-val"><strong>{student.enrollmentNo}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">SEMESTER/YEAR:</td>
                  <td className="admit-val">{termName.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">SESSION:</td>
                  <td className="admit-val">{student.session.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">COURSE:</td>
                  <td className="admit-val">{student.course.toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="admit-photo-col">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="admit-photo" />
            ) : (
              <div className="admit-no-photo">STUDENT PHOTO</div>
            )}
            <div className="admit-dob-box">
              DOB: {student.dob}
            </div>
          </div>
        </div>

        {/* Exam Schedule */}
        <h3 className="section-title">EXAMINATION SCHEDULE</h3>
        <table className="admit-schedule-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>SUB CODE</th>
              <th style={{ width: '45%', textAlign: 'left' }}>SUBJECT NAME</th>
              <th style={{ width: '20%' }}>DATE</th>
              <th style={{ width: '20%' }}>TIME</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td>{sub.code}</td>
                  <td style={{ textAlign: 'left' }}>{sub.name.toUpperCase()}</td>
                  <td>{getExamDate(marksheet.issueDate, idx)}</td>
                  <td>10:00 AM - 01:00 PM</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>NO SUBJECTS SCHEDULED</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Instructions */}
        <div className="admit-instructions">
          <h4>IMPORTANT INSTRUCTIONS FOR CANDIDATES:</h4>
          <ol>
            <li>Candidates must bring this Admit Card along with a valid photo ID proof to the examination center.</li>
            <li>Please report to the examination hall 30 minutes before the commencement of the exam.</li>
            <li>No electronic gadgets, mobile phones, or programmable calculators are allowed inside the examination hall.</li>
            <li>Any candidates found using unfair means will be summarily disqualified from the examination.</li>
          </ol>
        </div>

        {/* Signatures (Monogram and signature aligned together on the right side) */}
        <div className="admit-signatures">
          <div className="sig-block" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '18mm' }}>
            <div className="sig-line" style={{ borderTop: '1px solid #000', marginTop: 'auto', marginBottom: '1.5mm' }}></div>
            <div>SIGNATURE OF CANDIDATE</div>
          </div>
          
          <div className="sig-block-right" style={{ display: 'flex', alignItems: 'flex-end', gap: '4mm' }}>
            <div className="admit-sig-box" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45mm' }}>
              <img src="/Signature.png" alt="Controller Signature" className="admit-sig-img" style={{ height: '10mm', objectFit: 'contain', marginBottom: '-2mm', zIndex: 2, position: 'relative', left: '0', bottom: '0', transform: 'none' }} />
              <div className="sig-line" style={{ width: '100%', borderTop: '1px solid #000', marginTop: '1mm' }}></div>
              <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '1.5mm', textAlign: 'center', whiteSpace: 'nowrap' }}>CONTROLLER OF EXAMINATIONS</div>
            </div>
            <div className="admit-monogram-box" style={{ paddingBottom: '1mm' }}>
              <img src="/Monogram.png" alt="Monogram" style={{ width: '15mm', height: '15mm', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admit-card-layout {
          width: 210mm;
          height: 297mm;
          padding: 15mm;
          background: #fff;
          color: #000;
          font-family: Arial, sans-serif;
          box-sizing: border-box;
        }

        .admit-card-border {
          border: 2px solid #000;
          height: 100%;
          padding: 8mm;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          border-radius: 6px;
        }

        .admit-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 6mm;
          border-bottom: 2px double #000;
          padding-bottom: 3mm;
          margin-bottom: 4mm;
          width: 100%;
        }

        .admit-logo {
          height: 15mm;
          object-fit: contain;
          margin-bottom: 0;
          max-width: 38mm;
        }

        .admit-header-titles {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .admit-univ-title {
          font-family: Arial, sans-serif;
          font-size: 15pt;
          font-weight: 800;
          color: #0d2149;
          margin: 0;
          line-height: 1.2;
          text-align: left;
        }

        .admit-univ-loc {
          font-size: 8.5pt;
          font-weight: bold;
          color: #555;
          margin: 0.8mm 0 1.5mm 0;
          letter-spacing: 1px;
          text-align: left;
        }

        .admit-badge {
          display: inline-block;
          border: 1.5px solid #0d2149;
          color: #0d2149;
          font-size: 8.5pt;
          font-weight: bold;
          padding: 0.5mm 3mm;
          letter-spacing: 1.5px;
          border-radius: 2px;
          text-align: center;
        }

        .admit-details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4mm;
        }

        .admit-details-col {
          width: 72%;
        }

        .admit-photo-col {
          width: 25%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .admit-details-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admit-details-table td {
          padding: 1.0mm 1mm;
          font-size: 9pt;
          vertical-align: top;
        }

        .admit-lbl {
          font-weight: bold;
          color: #333;
          width: 35%;
        }

        .admit-val {
          color: #000;
        }

        .admit-photo {
          width: 24mm;
          height: 28mm;
          object-fit: cover;
          border: 1.5px solid #000;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
        }

        .admit-no-photo {
          width: 24mm;
          height: 28mm;
          border: 1.5px dashed #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 7.5pt;
          color: #666;
          text-align: center;
          padding: 2px;
        }

        .admit-dob-box {
          margin-top: 2mm;
          font-size: 8pt;
          font-weight: bold;
        }

        .section-title {
          font-size: 10pt;
          font-weight: bold;
          border-bottom: 1.5px solid #000;
          padding-bottom: 1mm;
          margin-bottom: 3mm;
          letter-spacing: 1px;
        }

        .admit-schedule-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 3mm;
          font-size: 8.5pt;
        }

        .admit-schedule-table th {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 1.2mm 1mm;
          font-weight: bold;
          background: #f9f9f9;
        }

        .admit-schedule-table td {
          border-bottom: 1px solid #ddd;
          padding: 1.2mm 1mm;
          text-align: center;
        }

        .admit-instructions {
          border: 1px solid #999;
          background: #fcfcfc;
          padding: 2mm 3mm;
          border-radius: 4px;
          margin-bottom: 4mm;
        }

        .admit-instructions h4 {
          font-size: 8pt;
          font-weight: bold;
          margin-bottom: 1.5mm;
        }

        .admit-instructions ol {
          font-size: 7.5pt;
          padding-left: 4mm;
          line-height: 1.4;
          color: #333;
        }

        .admit-signatures {
          margin-top: auto; /* Aligns to bottom border safely */
          margin-bottom: 2mm; /* Margin from bottom border */
          display: flex;
          justify-content: space-between;
          padding: 0 4mm;
        }

        .sig-block {
          width: 50mm;
          text-align: center;
          font-size: 7.5pt;
          font-weight: bold;
          color: #333;
        }

        .sig-line {
          border-top: 1.5px solid #000;
          margin-top: 8mm;
          margin-bottom: 1.5mm;
        }

        .admit-sig-img {
          height: 10mm;
          object-fit: contain;
        }
      ` }} />
    </div>
  );
}
