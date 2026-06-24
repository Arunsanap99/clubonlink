/**
 * CSV Helper Functions for Import/Export
 * Handles attendance exports, member imports, and general CSV operations
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) return '';

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - CSV content
 * @param {Array} expectedHeaders - Expected column headers
 * @returns {Object} { data: Array, errors: Array }
 */
export const parseCSV = (csvString, expectedHeaders = []) => {
  const lines = csvString.trim().split('\n');
  const errors = [];
  
  if (lines.length < 2) {
    return { data: [], errors: ['CSV must have at least a header row and one data row'] };
  }
  
  // Parse header row
  const headers = parseCSVRow(lines[0]);
  
  // Validate headers if expected headers provided
  if (expectedHeaders.length > 0) {
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
  }
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVRow(lines[i]);
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header.trim()] = values[index]?.trim() || '';
      });
      
      data.push(rowObject);
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }
  
  return { data, errors };
};

/**
 * Parse a single CSV row handling quoted values
 * @param {string} row - CSV row string
 * @returns {Array} Array of values
 */
const parseCSVRow = (row) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < row.length) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add final field
  values.push(current);
  
  return values;
};

/**
 * Download CSV file
 * @param {string} filename - Name of the file
 * @param {string} csvContent - CSV content string
 */
export const downloadCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export attendance session to CSV
 * @param {Object} session - Attendance session data
 * @param {Array} records - Attendance records
 * @returns {string} CSV content
 */
export const exportAttendanceCSV = (session, records) => {
  const data = records.map(record => ({
    'Name': record.name || 'Unknown',
    'Email': record.email || '',
    'Present': record.present ? 'Yes' : 'No',
    'Marked By': record.markedBy || 'Self',
    'Timestamp': record.timestamp ? new Date(record.timestamp).toLocaleString() : '',
    'User ID': record.uid || ''
  }));
  
  const csvContent = arrayToCSV(data);
  const filename = `attendance-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
  
  return { csvContent, filename };
};

/**
 * Export events to CSV
 * @param {Array} events - Events data
 * @returns {Object} { csvContent, filename }
 */
export const exportEventsCSV = (events) => {
  const data = events.map(event => ({
    'Title': event.title || '',
    'Description': event.description || '',
    'Start Date': event.startAt ? new Date(event.startAt).toLocaleString() : '',
    'End Date': event.endAt ? new Date(event.endAt).toLocaleString() : '',
    'Location': event.location || '',
    'Capacity': event.capacity || 'Unlimited',
    'RSVP Count': event.rsvpCount || 0,
    'Created By': event.createdByName || '',
    'Created At': event.createdAt ? new Date(event.createdAt).toLocaleString() : ''
  }));
  
  const csvContent = arrayToCSV(data);
  const filename = `events-${new Date().toISOString().split('T')[0]}.csv`;
  
  return { csvContent, filename };
};

/**
 * Export members to CSV
 * @param {Array} members - Members data
 * @returns {Object} { csvContent, filename }
 */
export const exportMembersCSV = (members) => {
  const data = members.map(member => ({
    'Name': member.name || '',
    'Email': member.email || '',
    'Role': member.role || 'member',
    'Status': member.status || 'active',
    'Joined At': member.joinedAt ? new Date(member.joinedAt).toLocaleString() : '',
    'Joined Via': member.joinedVia || '',
    'User ID': member.userId || member.uid || ''
  }));
  
  const csvContent = arrayToCSV(data);
  const filename = `members-${new Date().toISOString().split('T')[0]}.csv`;
  
  return { csvContent, filename };
};

/**
 * Parse member import CSV
 * @param {string} csvContent - CSV file content
 * @returns {Object} { members, errors }
 */
export const parseMemberImportCSV = (csvContent) => {
  const requiredHeaders = ['name', 'email'];
  const optionalHeaders = ['role'];
  
  const { data, errors } = parseCSV(csvContent, requiredHeaders);
  
  // Validate and transform member data
  const members = [];
  const validationErrors = [...errors];
  
  data.forEach((row, index) => {
    const member = {
      name: row.name?.trim(),
      email: row.email?.trim().toLowerCase(),
      role: row.role?.trim().toLowerCase() || 'member'
    };
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(member.email)) {
      validationErrors.push(`Row ${index + 2}: Invalid email format - ${member.email}`);
      return;
    }
    
    // Validate name
    if (!member.name || member.name.length < 2) {
      validationErrors.push(`Row ${index + 2}: Name must be at least 2 characters`);
      return;
    }
    
    // Validate role
    const validRoles = ['member', 'moderator', 'admin'];
    if (!validRoles.includes(member.role)) {
      validationErrors.push(`Row ${index + 2}: Invalid role - ${member.role}. Must be one of: ${validRoles.join(', ')}`);
      return;
    }
    
    members.push(member);
  });
  
  return { members, errors: validationErrors };
};

/**
 * Generate iCal content for event
 * @param {Object} event - Event data
 * @param {string} clubName - Club name
 * @returns {string} iCal content
 */
export const generateICal = (event, clubName = 'Club Event') => {
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const escapeText = (text) => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };
  
  const startDate = formatDate(event.startAt);
  const endDate = formatDate(event.endAt);
  const now = formatDate(new Date().toISOString());
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClubHub//Event//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@clubhub.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description || '')}`,
    `LOCATION:${escapeText(event.location || '')}`,
    `ORGANIZER:CN=${escapeText(clubName)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icalContent;
};

/**
 * Download iCal file
 * @param {string} filename - File name
 * @param {string} icalContent - iCal content
 */
export const downloadICal = (filename, icalContent) => {
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
