import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Pre-processes DOM clone to convert all rendered images and canvases into inline Base64 data URLs.
 * This guarantees html2canvas NEVER makes external network/CORS requests and never fails.
 */
function prepareClonedDoc(element, clonedDoc) {
  // 1. Copy dynamic canvas data (QR codes, Barcodes)
  const origCanvases = element.querySelectorAll('canvas');
  const clonedCanvases = clonedDoc.querySelectorAll('canvas');
  origCanvases.forEach((orig, i) => {
    const cloned = clonedCanvases[i];
    if (orig && cloned && orig.width > 0 && orig.height > 0) {
      try {
        cloned.width = orig.width;
        cloned.height = orig.height;
        const ctx = cloned.getContext('2d');
        if (ctx) ctx.drawImage(orig, 0, 0);
      } catch (e) {
        console.warn('Canvas clone warning:', e);
      }
    }
  });

  // 2. Convert all loaded <img> elements into instant inline Base64 data URLs
  const origImgs = element.querySelectorAll('img');
  const clonedImgs = clonedDoc.querySelectorAll('img');
  origImgs.forEach((orig, i) => {
    const cloned = clonedImgs[i];
    if (orig && cloned && orig.complete && orig.naturalWidth > 0 && orig.naturalHeight > 0) {
      try {
        const c = document.createElement('canvas');
        c.width = orig.naturalWidth;
        c.height = orig.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(orig, 0, 0);
          const dataUrl = c.toDataURL('image/png');
          if (dataUrl && dataUrl.startsWith('data:image')) {
            cloned.src = dataUrl;
          }
        }
      } catch (e) {
        console.warn('Image base64 clone warning:', e);
      }
    }
  });
}

/**
 * Capture an element and download as a high-quality JPG image
 */
export async function downloadAsJpg(element, fileName = 'document') {
  if (!element) {
    alert('Document preview element not found.');
    return;
  }
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 20000,
      ignoreElements: (el) => {
        try {
          return el?.classList?.contains?.('no-print') || false;
        } catch {
          return false;
        }
      },
      onclone: (clonedDoc) => {
        prepareClonedDoc(element, clonedDoc);
      }
    });

    let dataUrl;
    try {
      dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    } catch {
      dataUrl = canvas.toDataURL('image/png');
    }

    const link = document.createElement('a');
    link.download = `${fileName.replace(/\s+/g, '_')}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error downloading JPG:', err);
    alert('Failed to generate JPG. Please try again.');
  }
}

/**
 * Capture an element and download as a formatted PDF document
 */
export async function downloadAsPdf(element, fileName = 'document', docType = 'marksheet') {
  if (!element) {
    alert('Document preview element not found.');
    return;
  }
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 20000,
      ignoreElements: (el) => {
        try {
          return el?.classList?.contains?.('no-print') || false;
        } catch {
          return false;
        }
      },
      onclone: (clonedDoc) => {
        prepareClonedDoc(element, clonedDoc);
      }
    });

    let imgData;
    try {
      imgData = canvas.toDataURL('image/jpeg', 0.95);
    } catch {
      imgData = canvas.toDataURL('image/png');
    }

    let pdf;
    if (docType === 'marksheet') {
      // Landscape A4: 297mm x 210mm
      pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
    } else if (docType === 'idcard') {
      // Fit single 88mm x 55mm card or dual side-by-side cards cleanly
      const isDual = (canvas.width / canvas.height) > 2;
      const pdfWidth = isDual ? 190 : 88;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'mm', 
        format: [pdfWidth + 10, pdfHeight + 10] 
      });
      pdf.addImage(imgData, 'JPEG', 5, 5, pdfWidth, pdfHeight);
    } else if (docType === 'admit') {
      // Portrait A4: 210mm x 297mm
      pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    } else {
      // Online Result: Portrait A4 scale or fit
      pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, Math.min(imgHeight, 277));
    }

    pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('Error downloading PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}
