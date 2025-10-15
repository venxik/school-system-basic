jest.mock('@models', () => ({
  Student: {},
}));

import { StudentRepository } from '../StudentRepository';
import { Student } from '@models';

describe('StudentRepository', () => {
  let repository: StudentRepository;

  beforeEach(() => {
    repository = new StudentRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByEmails', () => {
    it('should find multiple students by emails', async () => {
      const mockStudents = [
        { id: 1, email: 'student1@test.com', name: 'Student 1' },
        { id: 2, email: 'student2@test.com', name: 'Student 2' },
      ] as Student[];
      (repository.findAll as jest.Mock).mockResolvedValue(mockStudents);

      const result = await repository.findByEmails([
        'student1@test.com',
        'student2@test.com',
      ]);

      expect(result).toEqual(mockStudents);
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { email: ['student1@test.com', 'student2@test.com'] },
        transaction: undefined,
      });
    });

    it('should return empty array when no students found', async () => {
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByEmails(['nonexistent@test.com']);

      expect(result).toEqual([]);
    });
  });

  describe('bulkUpsert', () => {
    it('should bulk upsert students', async () => {
      const students = [
        { email: 'student1@test.com', name: 'Student 1' },
        { email: 'student2@test.com', name: 'Student 2' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(students);

      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert).toHaveBeenCalledWith(
        { email: 'student1@test.com', name: 'Student 1' },
        undefined
      );
      expect(repository.upsert).toHaveBeenCalledWith(
        { email: 'student2@test.com', name: 'Student 2' },
        undefined
      );
    });

    it('should handle empty array', async () => {
      await repository.bulkUpsert([]);

      expect(repository.upsert).not.toHaveBeenCalled();
    });

    it('should handle multiple upserts in parallel', async () => {
      const students = [
        { email: 'student1@test.com', name: 'Student 1' },
        { email: 'student2@test.com', name: 'Student 2' },
        { email: 'student3@test.com', name: 'Student 3' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(students);

      expect(repository.upsert).toHaveBeenCalledTimes(3);
    });
  });
});
