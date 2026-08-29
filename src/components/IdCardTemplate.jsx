import React from 'react';

export default function IdCardTemplate({ student }) {
  // Derive validity from session
  // If session is e.g. "2024-2026", valid till 2026. If session is "2025 Final", valid till 2025.
  const getValidTill = (sessionStr) => {
    const years = sessionStr.match(/\b(20\d{2})\b/g);
    if (years && years.length > 0) {
      return `31-08-${years[years.length - 1]}`;
    }
    return '31-08-2028';
  };

  return (
    <div className="id-card-print-wrapper">
      <div className="id-card-layout">
        {/* Header decoration */}
        <div className="id-card-header">
          <img src="/DSVV-Logo.png" alt="DSVV Logo" className="id-card-monogram" />
          <div className="id-card-title-block">
            <h2 className="id-univ-title">DEV SANSKRITI VISHWAVIDYALAYA</h2>
            <p className="id-univ-loc">DURG, CHHATTISGARH</p>
          </div>
        </div>

        {/* Content body */}
        <div className="id-card-body">
          {/* Photo side */}
          <div className="id-photo-area">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="id-photo" />
            ) : (
              <div className="id-no-photo">PHOTO</div>
            )}
            <div className="id-badge">STUDENT</div>
          </div>

          {/* Details side */}
          <div className="id-details-area">
            <div className="id-student-name">{student.name.toUpperCase()}</div>
            
            <table className="id-details-table">
              <tbody>
                <tr>
                  <td className="id-lbl">ROLL NO:</td>
                  <td className="id-val"><strong>{student.rollNo}</strong></td>
                </tr>
                <tr>
                  <td className="id-lbl">ENROLL NO:</td>
                  <td className="id-val"><strong>{student.enrollmentNo}</strong></td>
                </tr>
                <tr>
                  <td className="id-lbl">COURSE:</td>
                  <td className="id-val">{student.course.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="id-lbl">SESSION:</td>
                  <td className="id-val">{student.session.toUpperCase()}</td>
                </tr>
                <tr>
                  <td className="id-lbl">D.O.B:</td>
                  <td className="id-val">{student.dob}</td>
                </tr>
                <tr>
                  <td className="id-lbl">VALID TILL:</td>
                  <td className="id-val" style={{ color: '#c62828', fontWeight: 'bold' }}>{getValidTill(student.session)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with branding / signature */}
        <div className="id-card-footer">
          <div className="id-footer-left">ISSUED BY THE UNIVERSITY</div>
          <div className="id-footer-right">
            <img src="/Signature.png" alt="Signature" className="id-sig-img" />
            <div className="id-sig-title">REGISTRAR</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .id-card-print-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: transparent;
        }

        .id-card-layout {
          width: 90mm;
          height: 56mm;
          background: #fff;
          color: #000;
          border: 1px solid #222;
          box-sizing: border-box;
          font-family: 'Inter', Arial, sans-serif;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .id-card-header {
          background-color: #0d2149;
          color: #fff;
          padding: 2.2mm 2.5mm;
          display: flex;
          align-items: center;
          border-bottom: 2px solid #e0a96d;
        }

        .id-card-monogram {
          width: 8mm;
          height: 8mm;
          margin-right: 2.2mm;
          filter: drop-shadow(0px 0px 1px rgba(255,255,255,0.8));
        }

        .id-card-title-block {
          flex: 1;
        }

        .id-univ-title {
          font-family: 'Cinzel', serif;
          font-size: 8.2pt;
          font-weight: 800;
          margin: 0;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .id-univ-loc {
          font-size: 5pt;
          font-weight: bold;
          margin: 0.3mm 0 0 0;
          letter-spacing: 0.8px;
          color: #e0a96d;
        }

        .id-card-body {
          flex: 1;
          display: flex;
          padding: 2mm;
          gap: 2.2mm;
        }

        .id-photo-area {
          width: 25mm;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .id-photo {
          width: 21mm;
          height: 25mm;
          object-fit: cover;
          border: 1px solid #333;
          border-radius: 2px;
        }

        .id-no-photo {
          width: 21mm;
          height: 25mm;
          border: 1px dashed #666;
          font-size: 6pt;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
        }

        .id-badge {
          background-color: #e0a96d;
          color: #000;
          font-size: 5pt;
          font-weight: bold;
          padding: 0.4mm 2.5mm;
          border-radius: 1mm;
          margin-top: 1.5mm;
          letter-spacing: 0.5px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .id-details-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .id-student-name {
          font-family: 'Outfit', sans-serif;
          font-size: 9.5pt;
          font-weight: 800;
          color: #0d2149;
          margin-bottom: 1.2mm;
          line-height: 1;
        }

        .id-details-table {
          width: 100%;
          border-collapse: collapse;
        }

        .id-details-table td {
          padding: 0.4mm 0;
          font-size: 6.2pt;
          vertical-align: top;
        }

        .id-lbl {
          font-weight: bold;
          color: #555;
          width: 32%;
        }

        .id-val {
          color: #000;
          font-weight: 500;
        }

        .id-card-footer {
          background-color: #f5f5f5;
          border-top: 1px solid #ddd;
          padding: 1mm 2mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 4.8pt;
          font-weight: bold;
          color: #666;
        }

        .id-footer-left {
          letter-spacing: 0.2px;
        }

        .id-footer-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          position: relative;
          height: 8mm;
          min-width: 22mm;
        }

        .id-sig-img {
          height: 4.8mm;
          object-fit: contain;
          margin-bottom: 0.3mm;
        }

        .id-sig-title {
          font-size: 4pt;
          color: #333;
          border-top: 0.5px solid #bbb;
          padding-top: 0.3mm;
          width: 100%;
          text-align: center;
        }
      ` }} />
    </div>
  );
}
