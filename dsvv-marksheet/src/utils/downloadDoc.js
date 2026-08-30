import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        try {
          return el?.classList?.contains?.('no-print') || false;
        } catch {
          return false;
        }
      },
      onclone: (clonedDoc) => {
        const origCanvases = element.querySelectorAll('canvas');
        const clonedCanvases = clonedDoc.querySelectorAll('canvas');
        origCanvases.forEach((orig, i) => {
          const cloned = clonedCanvases[i];
          if (orig && cloned) {
            cloned.width = orig.width;
            cloned.height = orig.height;
            const ctx = cloned.getContext('2d');
            if (ctx) ctx.drawImage(orig, 0, 0);
          }
        });
      }
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        try {
          return el?.classList?.contains?.('no-print') || false;
        } catch {
          return false;
        }
      },
      onclone: (clonedDoc) => {
        const origCanvases = element.querySelectorAll('canvas');
        const clonedCanvases = clonedDoc.querySelectorAll('canvas');
        origCanvases.forEach((orig, i) => {
          const cloned = clonedCanvases[i];
          if (orig && cloned) {
            cloned.width = orig.width;
            cloned.height = orig.height;
            const ctx = cloned.getContext('2d');
            if (ctx) ctx.drawImage(orig, 0, 0);
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

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
