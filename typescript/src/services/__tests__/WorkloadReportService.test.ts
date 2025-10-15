jest.mock('@repositories');

import { WorkloadReportService } from '../WorkloadReportService';
import { teacherClassSubjectRepository } from '@repositories';

const mockedTeacherClassSubjectRepo =
  teacherClassSubjectRepository as jest.Mocked<
    typeof teacherClassSubjectRepository
  >;

describe('WorkloadReportService', () => {
  let service: WorkloadReportService;

  beforeEach(() => {
    service = new WorkloadReportService();
    jest.clearAllMocks();
  });

  it('should generate workload report for teachers', async () => {
    const mockRelations = [
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 1, name: 'Teacher One' },
          Subject: { id: 1, code: 'MATH', name: 'Mathematics' },
          Class: { id: 1 },
        }),
      },
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 1, name: 'Teacher One' },
          Subject: { id: 1, code: 'MATH', name: 'Mathematics' },
          Class: { id: 2 },
        }),
      },
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 1, name: 'Teacher One' },
          Subject: { id: 2, code: 'ENG', name: 'English' },
          Class: { id: 1 },
        }),
      },
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 2, name: 'Teacher Two' },
          Subject: { id: 2, code: 'ENG', name: 'English' },
          Class: { id: 3 },
        }),
      },
    ];

    mockedTeacherClassSubjectRepo.findAllWithDetails.mockResolvedValue(
      mockRelations as never
    );

    const report = await service.generateReport();

    expect(report['Teacher One']).toBeDefined();
    expect(report['Teacher One']).toHaveLength(2);

    const mathWorkload = report['Teacher One'].find(
      (s) => s.subjectCode === 'MATH'
    );
    expect(mathWorkload?.numberOfClasses).toBe(2);

    const engWorkload = report['Teacher One'].find(
      (s) => s.subjectCode === 'ENG'
    );
    expect(engWorkload?.numberOfClasses).toBe(1);

    expect(report['Teacher Two']).toBeDefined();
    expect(report['Teacher Two']).toHaveLength(1);
    expect(report['Teacher Two'][0].subjectCode).toBe('ENG');
    expect(report['Teacher Two'][0].numberOfClasses).toBe(1);
  });

  it('should return empty report when no teachers exist', async () => {
    mockedTeacherClassSubjectRepo.findAllWithDetails.mockResolvedValue([]);

    const report = await service.generateReport();

    expect(Object.keys(report)).toHaveLength(0);
  });

  it('should skip relations with missing teacher or subject data', async () => {
    const mockRelations = [
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 1, name: 'Teacher One' },
          Subject: { id: 1, code: 'MATH', name: 'Mathematics' },
          Class: { id: 1 },
        }),
      },
      {
        get: jest.fn().mockReturnValue({
          Teacher: null,
          Subject: { id: 1, code: 'MATH', name: 'Mathematics' },
          Class: { id: 2 },
        }),
      },
      {
        get: jest.fn().mockReturnValue({
          Teacher: { id: 1, name: 'Teacher One' },
          Subject: null,
          Class: { id: 3 },
        }),
      },
    ];

    mockedTeacherClassSubjectRepo.findAllWithDetails.mockResolvedValue(
      mockRelations as never
    );

    const report = await service.generateReport();

    expect(report['Teacher One']).toBeDefined();
    expect(report['Teacher One']).toHaveLength(1);
    expect(report['Teacher One'][0].numberOfClasses).toBe(1);
  });
});
