import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Temporarily strip problematic CSS from an element and its parents, then restore after capture.
 */
function stripProblematicCSS(element) {
  const affected = [];
  let el = element;
  while (el && el !== document.body) {
    const s = el.style;
    const cs = window.getComputedStyle(el);
    const changes = {};
    if (cs.backdropFilter && cs.backdropFilter !== 'none') { changes.backdropFilter = cs.backdropFilter; s.backdropFilter = 'none'; }
    if (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none') { changes.webkitBackdropFilter = cs.webkitBackdropFilter; s.webkitBackdropFilter = 'none'; }
    if (cs.filter && cs.filter !== 'none') { changes.filter = cs.filter; s.filter = 'none'; }
    if (Object.keys(changes).length > 0) affected.push({ el, changes });
    el = el.parentElement;
  }
  return affected;
}

function restoreCSS(affected) {
  affected.forEach(({ el, changes }) => {
    Object.entries(changes).forEach(([prop, val]) => { el.style[prop] = val; });
  });
}

/**
 * Convert all <img> elements in a container to inline base64 data URLs
 */
async function inlineAllImages(container) {
  const imgs = container.querySelectorAll('img');
  for (const img of imgs) {
    if (img.complete && img.naturalWidth > 0 && img.src && !img.src.startsWith('data:')) {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        img.src = c.toDataURL('image/png');
      } catch (e) { console.warn('Image inline failed:', e); }
    }
  }
}

/**
 * JPG files have no physical paper-size metadata.  Use a fixed 10 px/mm A4
 * canvas for marksheets so every result-page download is exactly landscape A4.
 */
function createA4LandscapeJpgCanvas(sourceCanvas) {
  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = 2970;
  a4Canvas.height = 2100;
  const context = a4Canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, a4Canvas.width, a4Canvas.height);
  context.drawImage(sourceCanvas, 0, 0, a4Canvas.width, a4Canvas.height);
  return a4Canvas;
}

/**
 * Capture element and download as JPG
 */
export async function downloadAsJpg(element, fileName = 'document') {
  if (!element) { alert('Document preview element not found.'); return; }

  const affected = stripProblematicCSS(element);
  try {
    await inlineAllImages(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
    });

    const exportCanvas = element.classList.contains('marksheet-a4-landscape')
      ? createA4LandscapeJpgCanvas(canvas)
      : canvas;
    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    triggerDownload(dataUrl, `${fileName.replace(/\s+/g, '_')}.jpg`);
  } catch (err) {
    console.error('JPG download error:', err);
    alert('Failed to generate JPG: ' + String(err));
  } finally {
    restoreCSS(affected);
  }
}

/**
 * Capture element and download as PDF
 */
export async function downloadAsPdf(element, fileName = 'document', docType = 'marksheet') {
  if (!element) { alert('Document preview element not found.'); return; }

  const affected = stripProblematicCSS(element);
  try {
    await inlineAllImages(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    let pdf;
    if (docType === 'marksheet') {
      pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
    } else if (docType === 'idcard') {
      const isDual = (canvas.width / canvas.height) > 2;
      const pw = isDual ? 190 : 88;
      const ph = (canvas.height * pw) / canvas.width;
      pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pw + 10, ph + 10] });
      pdf.addImage(imgData, 'JPEG', 5, 5, pw, ph);
    } else if (docType === 'admit') {
      pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    } else {
      pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const iw = 190;
      const ih = (canvas.height * iw) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 10, 10, iw, Math.min(ih, 277));
    }

    pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
  } catch (err) {
    console.error('PDF download error:', err);
    alert('Failed to generate PDF: ' + String(err));
  } finally {
    restoreCSS(affected);
  }
}

function triggerDownload(dataUrl, name) {
  const link = document.createElement('a');
  link.download = name;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => document.body.removeChild(link), 200);
}
