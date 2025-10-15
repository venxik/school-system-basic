/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@repositories');

import { DataUploadService } from '../DataUploadService';
import {
  teacherRepository,
  studentRepository,
  classRepository,
  subjectRepository,
  teacherClassSubjectRepository,
  classStudentRepository,
  TTransaction,
} from '@repositories';

const mockedTeacherRepo = teacherRepository as jest.Mocked<
  typeof teacherRepository
>;
const mockedStudentRepo = studentRepository as jest.Mocked<
  typeof studentRepository
>;
const mockedClassRepo = classRepository as jest.Mocked<typeof classRepository>;
const mockedSubjectRepo = subjectRepository as jest.Mocked<
  typeof subjectRepository
>;
const mockedTeacherClassSubjectRepo =
  teacherClassSubjectRepository as jest.Mocked<
    typeof teacherClassSubjectRepository
  >;
const mockedClassStudentRepo = classStudentRepository as jest.Mocked<
  typeof classStudentRepository
>;

describe('DataUploadService', () => {
  let service: DataUploadService;
  let mockTransaction: TTransaction;

  beforeEach(() => {
    service = new DataUploadService();
    jest.clearAllMocks();

    mockTransaction = {} as any;
  });

  it('should create new records from CSV data', async () => {
    const csvData = [
      {
        teacherEmail: 'teacher1@test.com',
        teacherName: 'Teacher One',
        studentEmail: 'student1@test.com',
        studentName: 'Student One',
        classCode: 'P1-1',
        classname: 'Primary 1-1',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        toDelete: '0',
      },
    ];

    mockedTeacherRepo.findByEmails.mockResolvedValueOnce([]);
    mockedStudentRepo.findByEmails.mockResolvedValueOnce([]);
    mockedClassRepo.findByCodes.mockResolvedValueOnce([]);
    mockedSubjectRepo.findByCodes.mockResolvedValueOnce([]);

    mockedTeacherRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedStudentRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedClassRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedSubjectRepo.bulkUpsert.mockResolvedValue(undefined);

    mockedTeacherRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'teacher1@test.com', name: 'Teacher One' } as any,
    ]);
    mockedStudentRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'student1@test.com', name: 'Student One' } as any,
    ]);
    mockedClassRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any,
    ]);
    mockedSubjectRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'MATH', name: 'Mathematics' } as any,
    ]);

    mockedTeacherClassSubjectRepo.findOrCreateRelationship.mockResolvedValue(
      undefined
    );
    mockedClassStudentRepo.findOrCreateData.mockResolvedValue(undefined);

    await service.processData(csvData, mockTransaction);

    expect(mockedTeacherRepo.bulkUpsert).toHaveBeenCalledWith(
      [{ email: 'teacher1@test.com', name: 'Teacher One' }],
      mockTransaction
    );
    expect(mockedStudentRepo.bulkUpsert).toHaveBeenCalledWith(
      [{ email: 'student1@test.com', name: 'Student One' }],
      mockTransaction
    );
    expect(mockedClassRepo.bulkUpsert).toHaveBeenCalledWith(
      [{ code: 'P1-1', name: 'Primary 1-1' }],
      mockTransaction
    );
    expect(mockedSubjectRepo.bulkUpsert).toHaveBeenCalledWith(
      [{ code: 'MATH', name: 'Mathematics' }],
      mockTransaction
    );

    expect(
      mockedTeacherClassSubjectRepo.findOrCreateRelationship
    ).toHaveBeenCalledWith(1, 1, 1, mockTransaction);
    expect(mockedClassStudentRepo.findOrCreateData).toHaveBeenCalledWith(
      1,
      1,
      mockTransaction
    );
  });

  it('should delete relationships when toDelete is 1', async () => {
    const csvData = [
      {
        teacherEmail: 'teacher1@test.com',
        teacherName: 'Teacher One',
        studentEmail: 'student1@test.com',
        studentName: 'Student One',
        classCode: 'P1-1',
        classname: 'Primary 1-1',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        toDelete: '1',
      },
    ];

    mockedTeacherRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'teacher1@test.com', name: 'Teacher One' } as any,
    ]);
    mockedStudentRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'student1@test.com', name: 'Student One' } as any,
    ]);
    mockedClassRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any,
    ]);
    mockedSubjectRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'MATH', name: 'Mathematics' } as any,
    ]);

    mockedTeacherRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedStudentRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedClassRepo.bulkUpsert.mockResolvedValue(undefined);
    mockedSubjectRepo.bulkUpsert.mockResolvedValue(undefined);

    mockedTeacherRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'teacher1@test.com', name: 'Teacher One' } as any,
    ]);
    mockedStudentRepo.findByEmails.mockResolvedValueOnce([
      { id: 1, email: 'student1@test.com', name: 'Student One' } as any,
    ]);
    mockedClassRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any,
    ]);
    mockedSubjectRepo.findByCodes.mockResolvedValueOnce([
      { id: 1, code: 'MATH', name: 'Mathematics' } as any,
    ]);

    mockedClassStudentRepo.deleteByRelationship.mockResolvedValue(true);
    mockedTeacherClassSubjectRepo.deleteByRelationship.mockResolvedValue(true);

    await service.processData(csvData, mockTransaction);

    expect(mockedTeacherRepo.bulkUpsert).not.toHaveBeenCalled();
    expect(mockedStudentRepo.bulkUpsert).not.toHaveBeenCalled();
    expect(mockedClassRepo.bulkUpsert).not.toHaveBeenCalled();
    expect(mockedSubjectRepo.bulkUpsert).not.toHaveBeenCalled();

    expect(mockedClassStudentRepo.deleteByRelationship).toHaveBeenCalledWith(
      1,
      1,
      mockTransaction
    );
    expect(
      mockedTeacherClassSubjectRepo.deleteByRelationship
    ).toHaveBeenCalledWith(1, 1, 1, mockTransaction);
  });
});
