// Cloud & Google Drive Synchronization Utility for DSVV Student Database

export const APPS_SCRIPT_TEMPLATE = `// ============================================================
// DEV SANSKRITI VISHWAVIDYALAYA - GOOGLE DRIVE SYNC SCRIPT
// Paste this code into: Google Sheets > Extensions > Apps Script
// Then click "Deploy" > "New Deployment" > Web App > Anyone
// ============================================================

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;
    
    var scriptProps = PropertiesService.getScriptProperties();
    
    if (action === 'save') {
      // Save full database JSON to script property and timestamp
      scriptProps.setProperty('DSVV_DATABASE', JSON.stringify(payload.data));
      scriptProps.setProperty('LAST_UPDATED', new Date().toISOString());
      
      // Also write summary to Sheet
      try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        sheet.getRange(1, 1).setValue('LAST UPDATED');
        sheet.getRange(1, 2).setValue(new Date().toLocaleString());
        sheet.getRange(2, 1).setValue('TOTAL STUDENTS');
        sheet.getRange(2, 2).setValue((payload.data.students || []).length);
        sheet.getRange(3, 1).setValue('TOTAL COURSES');
        sheet.getRange(3, 2).setValue((payload.data.courses || []).length);
        sheet.getRange(4, 1).setValue('TOTAL CENTERS');
        sheet.getRange(4, 2).setValue((payload.data.centers || []).length);
        sheet.getRange(6, 1).setValue('FULL JSON DATA');
        sheet.getRange(6, 2).setValue(JSON.stringify(payload.data));
      } catch (err) {}
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data successfully backed up to Google Drive & Sheets!',
        updatedAt: new Date().toISOString(),
        studentsCount: (payload.data.students || []).length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'get') {
      var saved = scriptProps.getProperty('DSVV_DATABASE');
      var updated = scriptProps.getProperty('LAST_UPDATED');
      if (!saved) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'empty',
          message: 'No previous backup found on Google Drive.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: JSON.parse(saved),
        lastUpdated: updated
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var scriptProps = PropertiesService.getScriptProperties();
    var saved = scriptProps.getProperty('DSVV_DATABASE');
    var updated = scriptProps.getProperty('LAST_UPDATED');
    if (!saved) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'empty',
        message: 'No previous backup found on Google Drive.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: JSON.parse(saved),
      lastUpdated: updated
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Pushes entire local database to Google Drive / Apps Script endpoint
 */
export async function pushToGoogleDrive(endpointUrl, database) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    throw new Error('Please enter a valid Google Apps Script Web App URL.');
  }

  const payload = {
    action: 'save',
    data: {
      students: database.students || [],
      courses: database.courses || [],
      centers: database.centers || [],
      timestamp: new Date().toISOString()
    }
  };

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  try {
    const resData = await response.json();
    return resData;
  } catch (e) {
    return { status: 'success', message: 'Backup dispatched to Google Drive successfully.' };
  }
}

/**
 * Pulls latest database backup from Google Drive / Apps Script endpoint
 */
export async function pullFromGoogleDrive(endpointUrl) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    throw new Error('Please enter a valid Google Apps Script Web App URL.');
  }

  const response = await fetch(endpointUrl, {
    method: 'GET'
  });

  const resData = await response.json();
  if (resData.status === 'success' && resData.data) {
    return resData.data;
  } else if (resData.status === 'empty') {
    throw new Error('Google Drive has no stored backup yet. Please click "Sync to Google Drive" first.');
  } else {
    throw new Error(resData.message || 'Failed to pull from Google Drive.');
  }
}

/**
 * Exports complete database to a timestamped JSON file for offline or manual Google Drive storage
 */
export function exportDatabaseJson(database) {
  const d = new Date();
  const dateStr = d.toISOString().split('T')[0];
  const fullData = {
    version: '1.0',
    university: 'DEV SANSKRITI VISHWAVIDYALAYA',
    exportedAt: d.toISOString(),
    students: database.students || [],
    courses: database.courses || [],
    centers: database.centers || []
  };

  const jsonStr = JSON.stringify(fullData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DSVV_DATABASE_BACKUP_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and validates a JSON backup file
 */
export function importDatabaseJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.students && !parsed.courses && !Array.isArray(parsed)) {
          return reject(new Error('Invalid backup file format.'));
        }
        resolve({
          students: parsed.students || (Array.isArray(parsed) ? parsed : []),
          courses: parsed.courses || [],
          centers: parsed.centers || []
        });
      } catch (err) {
        reject(new Error('Failed to parse JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
