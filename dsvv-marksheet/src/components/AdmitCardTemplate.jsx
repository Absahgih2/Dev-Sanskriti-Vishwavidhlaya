import React from 'react';

function getExamDate(issueDateStr, index, session) {
  try {
    if (!issueDateStr) return 'TBA';
    const [dd, mm, yyyy] = issueDateStr.split('-').map(Number);
    const years = session?.match(/\b(20\d{2})\b/g);
    const startYear = years ? parseInt(years[0]) : yyyy;
    const date = new Date(Math.max(startYear, yyyy), mm - 1, dd);
    date.setDate(date.getDate() - 30);
    let count = 0;
    while (count < index) { date.setDate(date.getDate() + 1); if (date.getDay() !== 0) count++; }
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  } catch { return 'TBA'; }
}

export default function AdmitCardTemplate({ student, course, termName }) {
  if (!student || !course || !termName) return null;
  const marksheet = student.marksheets?.[termName] || { issueDate: '' };
  const subjects = course.terms?.[termName] || [];

  return (
    <div className="print-container admit-card-layout">
      <div className="admit-border">
        <div className="admit-header">
          <img src="/brand-logo.png" alt="Logo" className="admit-logo" />
          <div className="admit-titles">
            <h1>DEV SANSKRITI VISHWAVIDYALAYA</h1>
            <p>RAIPUR, CHHATTISGARH</p>
            <div className="admit-badge">ADMIT CARD</div>
          </div>
        </div>

        <div className="admit-row">
          <div className="admit-details">
            <table><tbody>
              <tr><td className="admit-lbl">STUDENT NAME:</td><td><strong>{student.name}</strong></td></tr>
              <tr><td className="admit-lbl">FATHER NAME:</td><td>{student.fatherName}</td></tr>
              <tr><td className="admit-lbl">MOTHER NAME:</td><td>{student.motherName}</td></tr>
              <tr><td className="admit-lbl">ROLL NO:</td><td><strong>{student.rollNo}</strong></td></tr>
              <tr><td className="admit-lbl">ENROLLMENT NO:</td><td><strong>{student.enrollmentNo}</strong></td></tr>
              <tr><td className="admit-lbl">SEMESTER/YEAR:</td><td>{termName}</td></tr>
              <tr><td className="admit-lbl">SESSION:</td><td>{student.session}</td></tr>
              <tr><td className="admit-lbl">COURSE:</td><td>{student.course}</td></tr>
            </tbody></table>
          </div>
          <div className="admit-photo-col">
            {student.photo ? <img src={student.photo} alt="" className="admit-photo" /> : <div className="admit-no-photo">STUDENT PHOTO</div>}
            <div className="admit-dob">DOB: {student.dob}</div>
          </div>
        </div>

        <h3 className="admit-section-title">EXAMINATION SCHEDULE</h3>
        <table className="admit-schedule">
          <thead><tr><th style={{ width: '12%' }}>SUB CODE</th><th style={{ width: '43%', textAlign: 'left' }}>SUBJECT NAME</th><th style={{ width: '22%' }}>DATE</th><th style={{ width: '23%' }}>TIME</th></tr></thead>
          <tbody>
            {subjects.length > 0 ? subjects.map((sub, idx) => (
              <tr key={idx}>
                <td>{sub.code}</td>
                <td style={{ textAlign: 'left' }}>{sub.name}</td>
                <td>{getExamDate(marksheet.issueDate, idx, student.session)}</td>
                <td>10:00 AM - 01:00 PM</td>
              </tr>
            )) : <tr><td colSpan={4}>NO SUBJECTS SCHEDULED</td></tr>}
          </tbody>
        </table>

        <div className="admit-instructions">
          <h4>IMPORTANT INSTRUCTIONS:</h4>
          <ol>
            <li>Bring this Admit Card with valid photo ID to the examination center.</li>
            <li>Report 30 minutes before exam commencement.</li>
            <li>No electronic gadgets, mobile phones allowed in exam hall.</li>
            <li>Unfair means will result in disqualification.</li>
          </ol>
        </div>

        <div className="admit-signatures">
          <div className="admit-sig-block">
            <div style={{ borderTop: '1px solid #000', marginTop: '12mm', marginBottom: '1.5mm' }}></div>
            <div>SIGNATURE OF CANDIDATE</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3mm' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src="/Signature.png" alt="" style={{ height: '8mm' }} />
              <div style={{ width: '35mm', borderTop: '1px solid #000', marginTop: '1mm' }}></div>
              <div style={{ fontSize: '7pt', fontWeight: 'bold', marginTop: '1mm' }}>CONTROLLER OF EXAMINATIONS</div>
            </div>
            <img src="/Monogram.png" alt="" style={{ width: '13mm', height: '13mm' }} />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admit-card-layout { width: 210mm; height: 297mm; padding: 12mm; background: #fff; color: #000; font-family: Arial, sans-serif; box-sizing: border-box; }
        .admit-border { border: 2px solid #000; height: 100%; padding: 6mm; display: flex; flex-direction: column; box-sizing: border-box; border-radius: 4px; }
        .admit-header { display: flex; align-items: center; gap: 5mm; border-bottom: 2px double #000; padding-bottom: 2mm; margin-bottom: 3mm; }
        .admit-logo { height: 14mm; object-fit: contain; max-width: 35mm; }
        .admit-titles { flex: 1; }
        .admit-titles h1 { font-size: 14pt; font-weight: 800; color: #0d2149; margin: 0; }
        .admit-titles p { font-size: 8pt; font-weight: bold; color: #555; margin: 0.5mm 0 1mm 0; letter-spacing: 1px; }
        .admit-badge { display: inline-block; border: 1.5px solid #0d2149; color: #0d2149; font-size: 8pt; font-weight: bold; padding: 0.5mm 3mm; letter-spacing: 1.5px; border-radius: 2px; }
        .admit-row { display: flex; justify-content: space-between; margin-bottom: 3mm; }
        .admit-details { width: 70%; }
        .admit-details table { width: 100%; border-collapse: collapse; }
        .admit-details td { padding: 0.8mm 1mm; font-size: 8.5pt; }
        .admit-lbl { font-weight: bold; color: #333; width: 32%; }
        .admit-photo-col { width: 25%; display: flex; flex-direction: column; align-items: center; }
        .admit-photo { width: 22mm; height: 26mm; object-fit: cover; border: 1.5px solid #000; }
        .admit-no-photo { width: 22mm; height: 26mm; border: 1.5px dashed #666; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: #666; }
        .admit-dob { margin-top: 1.5mm; font-size: 7.5pt; font-weight: bold; }
        .admit-section-title { font-size: 9pt; font-weight: bold; border-bottom: 1.5px solid #000; padding-bottom: 1mm; margin-bottom: 2mm; letter-spacing: 1px; }
        .admit-schedule { width: 100%; border-collapse: collapse; margin-bottom: 2mm; font-size: 8pt; }
        .admit-schedule th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 1mm; font-weight: bold; background: #f9f9f9; }
        .admit-schedule td { border-bottom: 1px solid #ddd; padding: 1mm; text-align: center; }
        .admit-instructions { border: 1px solid #999; background: #fcfcfc; padding: 2mm 3mm; border-radius: 4px; margin-bottom: 3mm; }
        .admit-instructions h4 { font-size: 7.5pt; font-weight: bold; margin-bottom: 1mm; }
        .admit-instructions ol { font-size: 7pt; padding-left: 4mm; line-height: 1.4; color: #333; }
        .admit-signatures { margin-top: auto; display: flex; justify-content: space-between; padding: 0 3mm; }
        .admit-sig-block { width: 50mm; text-align: center; font-size: 7pt; font-weight: bold; color: #333; }
      ` }} />
    </div>
  );
}
