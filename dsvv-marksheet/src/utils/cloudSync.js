// Cloud & Google Drive Synchronization Utility for DSVV Student Database

export const APPS_SCRIPT_TEMPLATE = `// ============================================================
// DEV SANSKRITI VISHWAVIDYALAYA - GOOGLE DRIVE SYNC SCRIPT
// Paste this code into: Google Sheets > Extensions > Apps Script
// Then click "Deploy" > "New Deployment" > Web App > Anyone
// ============================================================

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : (e && e.parameter && e.parameter.payload ? e.parameter.payload : '{}');
    var payload = JSON.parse(raw);
    var action = payload.action || 'save';
    var scriptProps = PropertiesService.getScriptProperties();
    
    if (action === 'save' && payload.data) {
      // Save entire database JSON to script property and timestamp
      scriptProps.setProperty('DSVV_DATABASE', JSON.stringify(payload.data));
      scriptProps.setProperty('LAST_UPDATED', new Date().toISOString());
      
      // Also write summary & backup directly to Google Sheet
      try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        sheet.getRange(1, 1).setValue('STATUS');
        sheet.getRange(1, 2).setValue('CONNECTED & SYNCED');
        sheet.getRange(2, 1).setValue('LAST UPDATED');
        sheet.getRange(2, 2).setValue(new Date().toLocaleString());
        sheet.getRange(3, 1).setValue('TOTAL STUDENTS');
        sheet.getRange(3, 2).setValue((payload.data.students || []).length);
        sheet.getRange(4, 1).setValue('TOTAL COURSES');
        sheet.getRange(4, 2).setValue((payload.data.courses || []).length);
        sheet.getRange(5, 1).setValue('TOTAL CENTERS');
        sheet.getRange(5, 2).setValue((payload.data.centers || []).length);
        sheet.getRange(7, 1).setValue('DATABASE BACKUP JSON');
        sheet.getRange(7, 2).setValue(JSON.stringify(payload.data));
      } catch (err) {}
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data successfully backed up to Google Drive & Sheets!',
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'get') {
      var saved = scriptProps.getProperty('DSVV_DATABASE');
      var updated = scriptProps.getProperty('LAST_UPDATED');
      if (!saved) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'empty', message: 'No backup found' })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: JSON.parse(saved), lastUpdated: updated })).setMimeType(ContentService.MimeType.JSON);
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
      return ContentService.createTextOutput(JSON.stringify({ status: 'empty', message: 'No backup found' })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: JSON.parse(saved), lastUpdated: updated })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

/**
 * Pushes entire local database to Google Drive / Apps Script endpoint
 * Uses no-cors mode to ensure zero CORS errors across all domains and browsers
 */
export async function pushToGoogleDrive(endpointUrl, database) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    throw new Error('Please enter a valid Google Apps Script Web App URL.');
  }

  let cleanUrl = endpointUrl.trim();
  if (cleanUrl.endsWith('/edit')) {
    cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
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

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    return { status: 'success', message: 'Data pushed to Google Drive successfully.' };
  } catch (err) {
    throw new Error('Failed to push to Google Drive. Check internet connection and URL.');
  }
}

/**
 * Pulls latest database backup from Google Drive / Apps Script endpoint
 */
export async function pullFromGoogleDrive(endpointUrl) {
  if (!endpointUrl || !endpointUrl.startsWith('http')) {
    throw new Error('Please enter a valid Google Apps Script Web App URL.');
  }

  let cleanUrl = endpointUrl.trim();
  if (cleanUrl.endsWith('/edit')) {
    cleanUrl = cleanUrl.replace(/\/edit$/, '/exec');
  }

  const urlWithParams = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=get&t=${Date.now()}`;

  try {
    const response = await fetch(urlWithParams, {
      method: 'GET',
      redirect: 'follow'
    });

    const resData = await response.json();
    if (resData.status === 'success' && resData.data) {
      return resData.data;
    } else if (resData.status === 'empty') {
      throw new Error('Google Drive has no stored backup yet. Please click "Push to Drive" first.');
    } else {
      throw new Error(resData.message || 'Failed to pull from Google Drive.');
    }
  } catch (err) {
    if (err.message.includes('Google Drive has no stored backup')) {
      throw err;
    }
    throw new Error('Failed to retrieve data from Google Drive. Ensure the Apps Script Web App access is set to "Anyone" and redeployed.');
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
