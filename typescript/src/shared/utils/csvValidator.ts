import { CsvItem } from '../types/CsvItem';

export interface ValidationError {
  row: number;
  field: string;
  value: unknown;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS: (keyof CsvItem)[] = [
  'teacherEmail',
  'teacherName',
  'studentEmail',
  'studentName',
  'classCode',
  'classname',
  'subjectCode',
  'subjectName',
  'toDelete',
];

export function validateCsvData(data: CsvItem[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data || data.length === 0) {
    return errors;
  }

  data.forEach((row, index) => {
    const rowNumber = index + 2;

    REQUIRED_FIELDS.forEach((field) => {
      const value = row[field];

      if (value == undefined) {
        errors.push({
          row: rowNumber,
          field,
          value: null,
          message: `Missing required field '${field}'`,
        });
      } else if (typeof value === 'string' && value.trim() === '') {
        errors.push({
          row: rowNumber,
          field,
          value: value,
          message: `Field '${field}' cannot be empty`,
        });
      }
    });

    if (row.teacherEmail && !EMAIL_REGEX.test(row.teacherEmail)) {
      errors.push({
        row: rowNumber,
        field: 'teacherEmail',
        value: row.teacherEmail,
        message: `Invalid email format: '${row.teacherEmail}'`,
      });
    }

    if (row.studentEmail && !EMAIL_REGEX.test(row.studentEmail)) {
      errors.push({
        row: rowNumber,
        field: 'studentEmail',
        value: row.studentEmail,
        message: `Invalid email format: '${row.studentEmail}'`,
      });
    }

    if (row.toDelete && row.toDelete !== '0' && row.toDelete !== '1') {
      errors.push({
        row: rowNumber,
        field: 'toDelete',
        value: row.toDelete,
        message: `Field 'toDelete' must be "0" or "1", got "${row.toDelete}"`,
      });
    }
  });

  return errors;
}

export function validateCsvHeaders(headers: string[]): string | null {
  const expectedHeaders = [...REQUIRED_FIELDS];
  const missingHeaders = expectedHeaders.filter(
    (header) => !headers.includes(header)
  );
  const extraHeaders = headers.filter(
    (header) => !expectedHeaders.includes(header as keyof CsvItem)
  );

  if (missingHeaders.length === 0 && extraHeaders.length === 0) {
    return null;
  }

  const errors: string[] = [];

  if (missingHeaders.length > 0) {
    errors.push(`Missing columns: ${missingHeaders.join(', ')}`);
  }

  if (extraHeaders.length > 0) {
    errors.push(`Unexpected columns: ${extraHeaders.join(', ')}`);
  }

  return errors.join('. ');
}
