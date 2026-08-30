import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export default function IdCardTemplate({ student, course, termName }) {
  if (!student) return null;

  const [activeSide, setActiveSide] = useState('both'); // 'both', 'front', 'back'

  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  const sessionYears = (student.session || '').match(/\b(20\d{2})\b/g);
  const finalYear = sessionYears && sessionYears.length > 0 ? sessionYears[sessionYears.length - 1] : '2026';

  const qrData = `DSVV STUDENT ID CARD\nName: ${student.name}\nRoll: ${student.rollNo}\nEnroll: ${student.enrollmentNo}\nCourse: ${student.course}\nSession: ${student.session}\nCenter: ${student.centerCode || 'DSVV-MAIN'}\nValid: 30/06/${finalYear}\nVerify: https://devsanskritivishwavidyalaya.com`;

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, qrData, { width: 50, margin: 0 });
    }
    if (barcodeRef.current && student.enrollmentNo) {
      try {
        JsBarcode(barcodeRef.current, String(student.enrollmentNo), {
          format: 'CODE128',
          width: 0.9,
          height: 14,
          displayValue: false,
          margin: 0
        });
      } catch (err) {}
    }
  }, [student, qrData, finalYear, activeSide]);

  return (
    <div className="idcard-main-container">
      {/* Side Toggle Selector */}
      <div className="idcard-side-toggle no-print">
        <button 
          className={`idcard-toggle-btn ${activeSide === 'both' ? 'active' : ''}`}
          onClick={() => setActiveSide('both')}
        >
          Dual View (Front & Back)
        </button>
        <button 
          className={`idcard-toggle-btn ${activeSide === 'front' ? 'active' : ''}`}
          onClick={() => setActiveSide('front')}
        >
          Front Side
        </button>
        <button 
          className={`idcard-toggle-btn ${activeSide === 'back' ? 'active' : ''}`}
          onClick={() => setActiveSide('back')}
        >
          Back Side
        </button>
      </div>

      <div className="idcard-dual-wrapper">
        {/* ============================================================
            FRONT SIDE (88mm x 55mm)
           ============================================================ */}
        {(activeSide === 'both' || activeSide === 'front') && (
          <div className="idcard-side-box">
            <div className="idcard-side-title no-print">FRONT SIDE (88mm &times; 55mm)</div>
            <div className="idcard-card idcard-front">
              {/* Header */}
              <div className="idcard-header">
                <img 
                  src="Dev_Sanskriti_Vishwavidyalaya Logo2.png" 
                  alt="University Logo" 
                  className="idcard-logo" 
                />
                <div className="idcard-univ-titles">
                  <h2>DEV SANSKRITI VISHWAVIDYALAYA</h2>
                  <p>DURG / RAIPUR, CHHATTISGARH</p>
                </div>
              </div>

              {/* Badge */}
              <div className="idcard-badge">STUDENT IDENTITY CARD</div>

              {/* Body Info */}
              <div className="idcard-body">
                {/* Left Column: Photo & DOB */}
                <div className="idcard-photo-box">
                  {student.photo ? (
                    <img src={student.photo} alt={student.name} className="idcard-photo-img" />
                  ) : (
                    <div className="idcard-no-photo">PHOTO</div>
                  )}
                  <div className="idcard-dob-tag">DOB: {student.dob}</div>
                </div>

                {/* Right Column: Student Info Details */}
                <div className="idcard-details-table">
                  <div className="idcard-row">
                    <span className="idcard-lbl">NAME</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val idcard-name-highlight">{student.name}</span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">F/H NAME</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val">{student.fatherName}</span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">M'S NAME</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val">{student.motherName}</span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">ROLL NO</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val"><strong>{student.rollNo}</strong></span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">ENROLL NO</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val"><strong>{student.enrollmentNo}</strong></span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">COURSE</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val idcard-course-val"><strong>{student.course}</strong></span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">SESSION</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val">{student.session}</span>
                  </div>
                  <div className="idcard-row">
                    <span className="idcard-lbl">VALID UPTO</span>
                    <span className="idcard-col">:</span>
                    <span className="idcard-val" style={{ color: '#0d2149', fontWeight: 'bold' }}>30/06/{finalYear}</span>
                  </div>
                </div>
              </div>

              {/* Front Footer: Holder Sig, Seal, Authorized Signatory */}
              <div className="idcard-footer">
                <div className="idcard-sig-col">
                  <div className="idcard-sig-line"></div>
                  <span className="idcard-sig-lbl">Holder's Signature</span>
                </div>

                <div className="idcard-seal-center">
                  <img src="Seal.png" alt="Seal" className="idcard-seal-img" />
                </div>

                <div className="idcard-sig-col">
                  <img src="Signature.png" alt="Authorized Signature" className="idcard-auth-sig-img" />
                  <div className="idcard-sig-line"></div>
                  <span className="idcard-sig-lbl">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            BACK SIDE (88mm x 55mm)
           ============================================================ */}
        {(activeSide === 'both' || activeSide === 'back') && (
          <div className="idcard-side-box">
            <div className="idcard-side-title no-print">BACK SIDE (88mm &times; 55mm)</div>
            <div className="idcard-card idcard-back">
              {/* Back Header */}
              <div className="idcard-back-header">
                <div className="idcard-back-univ-name">DEV SANSKRITI VISHWAVIDYALAYA</div>
                <div className="idcard-back-sub">STUDENT VERIFICATION & TERMS</div>
              </div>

              {/* Back Body */}
              <div className="idcard-back-body">
                {/* Left Side: Large QR Code & Barcode */}
                <div className="idcard-back-qr-box">
                  <div className="idcard-qr-canvas-wrap">
                    <canvas ref={qrRef} />
                  </div>
                  <div className="idcard-qr-lbl">SCAN TO VERIFY</div>
                  <div className="idcard-back-barcode">
                    <canvas ref={barcodeRef} />
                  </div>
                </div>

                {/* Right Side: Prominent Instructions & Guidelines */}
                <div className="idcard-back-details">
                  <div className="idcard-back-instructions-title">TERMS & INSTRUCTIONS</div>
                  <ol className="idcard-back-terms-list">
                    <li>This card is non-transferable and remains property of DSVV.</li>
                    <li>Must be displayed during campus entry &amp; examinations.</li>
                    <li>Loss of card must be reported to the Registrar Office.</li>
                  </ol>
                </div>
              </div>

              {/* Back Footer */}
              <div className="idcard-back-footer">
                <span>Website: www.devsanskritivishwavidyalaya.com</span>
                <span>Helpline: info@devsanskritivishwavidyalaya.com</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .idcard-main-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 12px;
          box-sizing: border-box;
        }

        .idcard-side-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
        }

        .idcard-toggle-btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .idcard-toggle-btn.active {
          background: #0d2149;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(13, 33, 73, 0.25);
        }

        .idcard-dual-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          justify-content: center;
          align-items: flex-start;
        }

        .idcard-side-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .idcard-side-title {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        /* 88mm x 55mm Exact ID Card */
        .idcard-card {
          width: 88mm;
          height: 55mm;
          min-width: 88mm;
          min-height: 55mm;
          max-width: 88mm;
          max-height: 55mm;
          background: #ffffff;
          border: 1.2px solid #0d2149;
          border-radius: 3mm;
          padding: 2mm 3mm;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
          box-shadow: 0 4px 14px rgba(0,0,0,0.18);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          background-clip: padding-box;
        }

        /* FRONT SPECIFIC STYLES */
        .idcard-header {
          display: flex;
          align-items: center;
          gap: 2mm;
          border-bottom: 1px solid #0d2149;
          padding-bottom: 1mm;
        }

        .idcard-logo {
          height: 7mm;
          max-width: 16mm;
          object-fit: contain;
        }

        .idcard-univ-titles {
          flex: 1;
          text-align: center;
        }

        .idcard-univ-titles h2 {
          font-size: 5.6pt;
          font-weight: 800;
          color: #0d2149;
          margin: 0;
          letter-spacing: 0.3px;
          line-height: 1.1;
        }

        .idcard-univ-titles p {
          font-size: 4pt;
          font-weight: 600;
          color: #64748b;
          margin: 0.3mm 0 0;
          letter-spacing: 0.3px;
          line-height: 1;
        }

        .idcard-badge {
          background: #0d2149;
          color: #d4af37;
          text-align: center;
          font-size: 4.6pt;
          font-weight: 800;
          letter-spacing: 0.8px;
          padding: 0.5mm 0;
          margin: 0.6mm 0;
          border-radius: 1.5px;
          line-height: 1.1;
        }

        .idcard-body {
          display: flex;
          gap: 2.5mm;
          flex: 1;
          align-items: center;
        }

        .idcard-photo-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 17mm;
        }

        .idcard-photo-img {
          width: 16mm;
          height: 20mm;
          object-fit: cover;
          border: 1px solid #0d2149;
          border-radius: 1.5px;
        }

        .idcard-no-photo {
          width: 16mm;
          height: 20mm;
          border: 1px dashed #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4.5pt;
          color: #94a3b8;
          font-weight: bold;
        }

        .idcard-dob-tag {
          font-size: 3.8pt;
          font-weight: 700;
          margin-top: 0.4mm;
          color: #334155;
          white-space: nowrap;
        }

        .idcard-details-table {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.35mm;
          min-width: 0;
        }

        .idcard-row {
          display: flex;
          align-items: baseline;
          font-size: 4.4pt;
          line-height: 1.18;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .idcard-lbl {
          width: 16mm;
          font-weight: 600;
          color: #475569;
          font-size: 4pt;
          flex-shrink: 0;
        }

        .idcard-col {
          width: 2mm;
          font-weight: bold;
          flex-shrink: 0;
        }

        .idcard-val {
          font-weight: 600;
          color: #0f172a;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .idcard-name-highlight {
          color: #0d2149;
          font-weight: 800;
          font-size: 5pt;
        }

        .idcard-course-val {
          font-size: 4.4pt;
        }

        .idcard-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 0.8px dashed #cbd5e1;
          padding-top: 0.6mm;
          margin-top: 0.6mm;
        }

        .idcard-seal-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .idcard-seal-img {
          height: 6.5mm;
          width: 6.5mm;
          object-fit: contain;
        }

        .idcard-sig-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 24mm;
        }

        .idcard-auth-sig-img {
          height: 4.5mm;
          object-fit: contain;
          margin-bottom: -0.5mm;
        }

        .idcard-sig-line {
          width: 100%;
          border-top: 0.8px solid #000;
          margin-top: 1.5mm;
        }

        .idcard-sig-lbl {
          font-size: 3.6pt;
          font-weight: 700;
          color: #334155;
          margin-top: 0.3mm;
          white-space: nowrap;
        }

        /* BACK SPECIFIC STYLES */
        .idcard-back {
          background: #fdfdfd;
        }

        .idcard-back-header {
          background: #0d2149;
          color: #ffffff;
          padding: 1mm 2mm;
          border-radius: 1.5px;
          text-align: center;
          margin-bottom: 1.5mm;
        }

        .idcard-back-univ-name {
          font-size: 5.2pt;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .idcard-back-sub {
          font-size: 3.6pt;
          color: #d4af37;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .idcard-back-body {
          display: flex;
          gap: 3mm;
          flex: 1;
          align-items: center;
        }

        .idcard-back-qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 22mm;
        }

        .idcard-qr-canvas-wrap {
          border: 1px solid #0d2149;
          padding: 0.8mm;
          background: #fff;
          border-radius: 1.5px;
        }

        .idcard-qr-canvas-wrap canvas {
          width: 14mm !important;
          height: 14mm !important;
          display: block;
        }

        .idcard-qr-lbl {
          font-size: 3.4pt;
          font-weight: 800;
          color: #0d2149;
          margin-top: 0.4mm;
          letter-spacing: 0.3px;
        }

        .idcard-back-barcode {
          margin-top: 0.6mm;
        }

        .idcard-back-barcode canvas {
          width: 20mm !important;
          height: 5mm !important;
          display: block;
        }

        .idcard-back-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          min-width: 0;
          padding-left: 1mm;
        }

        .idcard-back-instructions-title {
          font-size: 5.2pt;
          font-weight: 800;
          color: #0d2149;
          border-bottom: 0.8px solid #cbd5e1;
          padding-bottom: 0.4mm;
          margin-bottom: 1mm;
          letter-spacing: 0.3px;
        }

        .idcard-back-terms-list {
          margin: 0;
          padding-left: 3.5mm;
          font-size: 4.8pt;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.45;
        }

        .idcard-back-terms-list li {
          margin-bottom: 0.8mm;
        }

        .idcard-back-footer {
          border-top: 0.6px solid #0d2149;
          padding-top: 0.5mm;
          margin-top: 0.8mm;
          display: flex;
          justify-content: space-between;
          font-size: 3.6pt;
          font-weight: 600;
          color: #64748b;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .idcard-main-container {
            padding: 0;
          }
          .idcard-card {
            box-shadow: none;
            border: 1.2px solid #0d2149;
          }
        }
      `}} />
    </div>
  );
}
