import React from 'react';

function getExamDate(issueDateStr, index, session) {
  try {
    if (!issueDateStr) {
      // Default auto-generated exam dates for June 2026
      const baseDate = new Date(2026, 5, 10);
      baseDate.setDate(baseDate.getDate() + (index * 2));
      return `${String(baseDate.getDate()).padStart(2, '0')}-06-2026`;
    }
    const parts = issueDateStr.split(/[-/]/).map(Number);
    let dd = parts[0], mm = parts[1], yyyy = parts[2];
    if (parts[0] > 1000) { yyyy = parts[0]; mm = parts[1]; dd = parts[2]; }
    const date = new Date(yyyy || 2026, (mm || 6) - 1, dd || 1);
    date.setDate(date.getDate() - 15 + (index * 2));
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  } catch {
    return '15-06-2026';
  }
}

export default function AdmitCardTemplate({ student, course, termName }) {
  if (!student || !course || !termName) return null;
  const marksheet = student.marksheets?.[termName] || { issueDate: '20-08-2026' };
  const subjects = course.terms?.[termName] || [];

  return (
    <div className="print-container admit-card-layout">
      <div className="admit-border">
        {/* Official Header with Dev_Sanskriti_Vishwavidyalaya Logo2 */}
        <div className="admit-header">
          <img 
            src="Dev_Sanskriti_Vishwavidyalaya Logo2.png" 
            alt="Dev Sanskriti Vishwavidyalaya Logo" 
            className="admit-logo" 
          />
          <div className="admit-titles">
            <h1>DEV SANSKRITI VISHWAVIDYALAYA</h1>
            <p>DURG / RAIPUR, CHHATTISGARH</p>
            <div className="admit-badge">EXAMINATION ADMIT CARD</div>
          </div>
        </div>

        {/* Candidate Profile Details & Photo */}
        <div className="admit-row">
          <div className="admit-details">
            <table>
              <tbody>
                <tr>
                  <td className="admit-lbl">STUDENT NAME:</td>
                  <td><strong>{student.name}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">FATHER NAME:</td>
                  <td>{student.fatherName}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">MOTHER NAME:</td>
                  <td>{student.motherName}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">ROLL NO:</td>
                  <td><strong>{student.rollNo}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">ENROLLMENT NO:</td>
                  <td><strong>{student.enrollmentNo}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">SEMESTER/YEAR:</td>
                  <td><strong>{termName}</strong></td>
                </tr>
                <tr>
                  <td className="admit-lbl">SESSION:</td>
                  <td>{student.session}</td>
                </tr>
                <tr>
                  <td className="admit-lbl">COURSE:</td>
                  <td><strong>{student.course}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="admit-photo-col">
            {student.photo ? (
              <img src={student.photo} alt="Student" className="admit-photo" />
            ) : (
              <div className="admit-no-photo">STUDENT PHOTO</div>
            )}
            <div className="admit-dob">DOB: {student.dob}</div>
          </div>
        </div>

        {/* Examination Schedule */}
        <h3 className="admit-section-title">EXAMINATION SCHEDULE</h3>
        <table className="admit-schedule">
          <thead>
            <tr>
              <th style={{ width: '15%', whiteSpace: 'nowrap' }}>SUB CODE</th>
              <th style={{ width: '43%', textAlign: 'left' }}>SUBJECT NAME</th>
              <th style={{ width: '18%', whiteSpace: 'nowrap' }}>DATE</th>
              <th style={{ width: '24%', whiteSpace: 'nowrap' }}>TIME</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((sub, idx) => (
                <tr key={sub.code || idx}>
                  <td style={{ whiteSpace: 'nowrap' }}>{sub.code}</td>
                  <td style={{ textAlign: 'left', fontWeight: '500' }}>{sub.name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{getExamDate(marksheet.issueDate, idx, student.session)}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '7.5pt' }}>10:00 AM - 01:00 PM</td>
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
          <h4>IMPORTANT INSTRUCTIONS:</h4>
          <ol>
            <li>Bring this Admit Card along with valid government photo ID to the examination center.</li>
            <li>Report to the examination center at least 30 minutes before exam commencement.</li>
            <li>No electronic gadgets, mobile phones, or smartwatches are permitted in the exam hall.</li>
            <li>Use of any unfair means will result in immediate disqualification and disciplinary action.</li>
          </ol>
        </div>

        {/* Signatures */}
        <div className="admit-signatures">
          <div className="admit-sig-block">
            <div style={{ borderTop: '1px solid #000', marginTop: '12mm', marginBottom: '1.5mm' }}></div>
            <div>SIGNATURE OF CANDIDATE</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="Signature.png" alt="Signature" style={{ height: '9mm', marginBottom: '1mm' }} />
            <div style={{ width: '45mm', borderTop: '1px solid #000' }}></div>
            <div style={{ fontSize: '7.5pt', fontWeight: 'bold', marginTop: '1.5mm' }}>CONTROLLER OF EXAMINATIONS</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admit-card-layout { width: 210mm; min-height: 297mm; padding: 10mm; background: #fff; color: #000; font-family: Arial, sans-serif; box-sizing: border-box; margin: 0 auto; }
        .admit-border { border: 2px solid #0d2149; height: 100%; padding: 6mm; display: flex; flex-direction: column; box-sizing: border-box; border-radius: 4px; }
        .admit-header { display: flex; align-items: center; gap: 4mm; border-bottom: 2px double #0d2149; padding-bottom: 3mm; margin-bottom: 4mm; }
        .admit-logo { height: 18mm; object-fit: contain; max-width: 38mm; }
        .admit-titles { flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; }
        .admit-titles h1 { font-size: 13.5pt; font-weight: 800; color: #0d2149; margin: 0; text-align: center; letter-spacing: 0.5px; }
        .admit-titles p { font-size: 8.5pt; color: #64748b; margin: 1mm 0 2mm; font-weight: 600; text-align: center; }
        .admit-badge { display: inline-block; background: #0d2149; color: #d4af37; padding: 1.5mm 4mm; font-weight: bold; font-size: 8.5pt; letter-spacing: 1.5px; border-radius: 3px; text-align: center; }
        .admit-row { display: flex; justify-content: space-between; margin-bottom: 4mm; gap: 4mm; }
        .admit-details { flex: 1; }
        .admit-details table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
        .admit-details td { padding: 1.2mm 1.5mm; }
        .admit-lbl { font-weight: 600; width: 34mm; color: #334155; }
        .admit-photo-col { width: 32mm; display: flex; flex-direction: column; align-items: center; }
        .admit-photo { width: 28mm; height: 35mm; object-fit: cover; border: 1.5px solid #000; border-radius: 2px; }
        .admit-no-photo { width: 28mm; height: 35mm; border: 1.5px dashed #999; display: flex; align-items: center; justify-content: center; font-size: 7pt; color: #999; text-align: center; }
        .admit-dob { font-size: 7.5pt; margin-top: 1.5mm; font-weight: 600; }
        .admit-section-title { font-size: 9.5pt; font-weight: 800; color: #0d2149; margin: 3mm 0 2mm; border-bottom: 1.5px solid #0d2149; padding-bottom: 1mm; }
        .admit-schedule { width: 100%; border-collapse: collapse; font-size: 8pt; margin-bottom: 4mm; }
        .admit-schedule th { background: #0d2149; color: #fff; padding: 2mm; border: 1px solid #0d2149; text-align: center; font-weight: 700; }
        .admit-schedule td { padding: 2mm; border: 1px solid #cbd5e1; text-align: center; }
        .admit-instructions { border: 1px solid #e2e8f0; background: #f8fafc; padding: 3mm 4mm; border-radius: 3px; font-size: 7.5pt; margin-bottom: 4mm; }
        .admit-instructions h4 { margin: 0 0 1.5mm; font-size: 8pt; color: #0d2149; }
        .admit-instructions ol { margin: 0; padding-left: 5mm; }
        .admit-instructions li { margin-bottom: 1mm; }
        .admit-signatures { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 3mm; }
        .admit-sig-block { font-size: 7.5pt; font-weight: bold; text-align: center; width: 45mm; }
      `}} />
    </div>
  );
}
