/* eslint-disable quotes */
import { validateCsvData, validateCsvHeaders } from '../csvValidator';
import { CsvItem } from '../../types/CsvItem';

describe('csvValidator', () => {
  describe('validateCsvData', () => {
    it('should return no errors for valid data', () => {
      const validData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@gmail.com',
          teacherName: 'Teacher 1',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];

      const errors = validateCsvData(validData);
      expect(errors).toEqual([]);
    });

    it('should return errors for missing required fields', () => {
      const invalidData = [
        {
          teacherEmail: 'teacher1@gmail.com',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ] as CsvItem[];

      const errors = validateCsvData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatchObject({
        row: 2,
        field: 'teacherName',
        message: "Missing required field 'teacherName'",
      });
    });

    it('should return errors for empty string fields', () => {
      const invalidData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@gmail.com',
          teacherName: '',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];

      const errors = validateCsvData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatchObject({
        row: 2,
        field: 'teacherName',
        message: "Field 'teacherName' cannot be empty",
      });
    });

    it('should return errors for invalid email format', () => {
      const invalidData: CsvItem[] = [
        {
          teacherEmail: 'not-an-email',
          teacherName: 'Teacher 1',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];

      const errors = validateCsvData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatchObject({
        row: 2,
        field: 'teacherEmail',
        value: 'not-an-email',
        message: "Invalid email format: 'not-an-email'",
      });
    });

    it('should return errors for invalid toDelete value', () => {
      const invalidData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@gmail.com',
          teacherName: 'Teacher 1',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: 'yes',
        },
      ];

      const errors = validateCsvData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatchObject({
        row: 2,
        field: 'toDelete',
        value: 'yes',
        message: 'Field \'toDelete\' must be "0" or "1", got "yes"',
      });
    });

    it('should return empty array for empty data', () => {
      const errors = validateCsvData([]);
      expect(errors).toEqual([]);
    });

    it('should accept valid toDelete values "0" and "1"', () => {
      const validData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@gmail.com',
          teacherName: 'Teacher 1',
          studentEmail: 'student1@gmail.com',
          studentName: 'Student 1',
          classCode: 'P1-1',
          classname: 'P1 Integrity',
          subjectCode: 'MATHS',
          subjectName: 'Mathematics',
          toDelete: '1',
        },
      ];

      const errors = validateCsvData(validData);
      expect(errors).toEqual([]);
    });
  });

  describe('validateCsvHeaders', () => {
    const validHeaders = [
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

    it('should return null for valid headers', () => {
      const error = validateCsvHeaders(validHeaders);
      expect(error).toBeNull();
    });

    it('should return error for missing headers', () => {
      const headers = [
        'teacherEmail',
        'teacherName',
        'studentEmail',
        'studentName',
      ];

      const error = validateCsvHeaders(headers);
      expect(error).toContain('Missing columns');
      expect(error).toContain('classCode');
    });

    it('should return error for extra headers', () => {
      const headers = [...validHeaders, 'extraColumn'];

      const error = validateCsvHeaders(headers);
      expect(error).toContain('Unexpected columns');
      expect(error).toContain('extraColumn');
    });

    it('should return error for both missing and extra headers', () => {
      const headers = ['teacherEmail', 'teacherName', 'extraColumn'];

      const error = validateCsvHeaders(headers);
      expect(error).toContain('Missing columns');
      expect(error).toContain('Unexpected columns');
    });

    it('should handle empty headers array', () => {
      const error = validateCsvHeaders([]);
      expect(error).toContain('Missing columns');
    });
  });
});
