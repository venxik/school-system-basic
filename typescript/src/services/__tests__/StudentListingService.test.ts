/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@repositories');
jest.mock('../ExternalStudentService');

import { StudentListingService } from '../StudentListingService';
import { classRepository, studentRepository } from '@repositories';
import ExternalStudentService from '../ExternalStudentService';

const mockedExternalService = ExternalStudentService as jest.Mocked<
  typeof ExternalStudentService
>;
const mockedClassRepository = classRepository as jest.Mocked<
  typeof classRepository
>;
const mockedStudentRepository = studentRepository as jest.Mocked<
  typeof studentRepository
>;

describe('StudentListingService', () => {
  let service: StudentListingService;

  beforeEach(() => {
    service = new StudentListingService();
    jest.clearAllMocks();
  });

  it('should throw error when class not found', async () => {
    mockedClassRepository.findByCode.mockResolvedValue(null);
    mockedExternalService.fetchStudents.mockResolvedValue({
      count: 0,
      students: [],
    });

    await expect(service.getStudents('NONEXISTENT', 0, 10)).rejects.toThrow(
      'Class NONEXISTENT not found'
    );
  });

  it('should return only local students when no external students exist', async () => {
    const mockClass = { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any;
    const mockStudents = [
      { id: 1, email: 'alice@test.com', name: 'Alice' },
      { id: 2, email: 'bob@test.com', name: 'Bob' },
    ] as any[];

    mockedClassRepository.findByCode.mockResolvedValue(mockClass);
    mockedStudentRepository.findAll.mockResolvedValue(mockStudents);
    mockedExternalService.fetchStudents.mockResolvedValue({
      count: 0,
      students: [],
    });

    const result = await service.getStudents('P1-1', 0, 10);

    expect(result.count).toBe(2);
    expect(result.students).toHaveLength(2);
    expect(result.students[0].email).toBe('alice@test.com');
    expect(result.students[1].email).toBe('bob@test.com');
  });

  it('should merge and sort local and external students by email', async () => {
    const mockClass = { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any;
    const mockStudents = [
      { id: 1, email: 'charlie@test.com', name: 'Charlie' },
      { id: 2, email: 'alice@test.com', name: 'Alice' },
    ] as any[];

    mockedClassRepository.findByCode.mockResolvedValue(mockClass);
    mockedStudentRepository.findAll.mockResolvedValue(mockStudents);
    mockedExternalService.fetchStudents.mockResolvedValue({
      count: 2,
      students: [
        { id: 100, name: 'Bob External', email: 'bob@test.com' },
        { id: 101, name: 'David External', email: 'david@test.com' },
      ],
    });

    const result = await service.getStudents('P1-1', 0, 10);

    expect(result.count).toBe(4);
    expect(result.students).toHaveLength(4);
    expect(result.students[0].email).toBe('alice@test.com');
    expect(result.students[1].email).toBe('bob@test.com');
    expect(result.students[2].email).toBe('charlie@test.com');
    expect(result.students[3].email).toBe('david@test.com');
  });

  it('should apply pagination correctly', async () => {
    const mockClass = { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any;
    const mockStudents = [
      { id: 1, email: 'alice@test.com', name: 'Alice' },
      { id: 2, email: 'bob@test.com', name: 'Bob' },
      { id: 3, email: 'charlie@test.com', name: 'Charlie' },
    ] as any[];

    mockedClassRepository.findByCode.mockResolvedValue(mockClass);
    mockedStudentRepository.findAll.mockResolvedValue(mockStudents);
    mockedExternalService.fetchStudents.mockResolvedValue({
      count: 2,
      students: [
        { id: 100, name: 'David External', email: 'david@test.com' },
        { id: 101, name: 'Eve External', email: 'eve@test.com' },
      ],
    });

    const result = await service.getStudents('P1-1', 2, 2);

    expect(result.count).toBe(5);
    expect(result.students).toHaveLength(2);
    expect(result.students[0].email).toBe('charlie@test.com');
    expect(result.students[1].email).toBe('david@test.com');
  });

  it('should return empty students array when no students exist', async () => {
    const mockClass = { id: 1, code: 'P1-1', name: 'Primary 1-1' } as any;

    mockedClassRepository.findByCode.mockResolvedValue(mockClass);
    mockedStudentRepository.findAll.mockResolvedValue([]);
    mockedExternalService.fetchStudents.mockResolvedValue({
      count: 0,
      students: [],
    });

    const result = await service.getStudents('P1-1', 0, 10);

    expect(result.count).toBe(0);
    expect(result.students).toHaveLength(0);
  });
});
