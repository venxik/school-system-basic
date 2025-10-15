jest.mock('@models', () => ({
  Teacher: {},
}));

import { TeacherRepository } from '../TeacherRepository';
import { Teacher } from '@models';

describe('TeacherRepository', () => {
  let repository: TeacherRepository;

  beforeEach(() => {
    repository = new TeacherRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByEmails', () => {
    it('should find multiple teachers by emails', async () => {
      const mockTeachers = [
        { id: 1, email: 'teacher1@test.com', name: 'Teacher 1' },
        { id: 2, email: 'teacher2@test.com', name: 'Teacher 2' },
      ] as Teacher[];
      (repository.findAll as jest.Mock).mockResolvedValue(mockTeachers);

      const result = await repository.findByEmails([
        'teacher1@test.com',
        'teacher2@test.com',
      ]);

      expect(result).toEqual(mockTeachers);
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { email: ['teacher1@test.com', 'teacher2@test.com'] },
        transaction: undefined,
      });
    });

    it('should return empty array when no teachers found', async () => {
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByEmails(['nonexistent@test.com']);

      expect(result).toEqual([]);
    });
  });

  describe('bulkUpsert', () => {
    it('should bulk upsert teachers', async () => {
      const teachers = [
        { email: 'teacher1@test.com', name: 'Teacher 1' },
        { email: 'teacher2@test.com', name: 'Teacher 2' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(teachers);

      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert).toHaveBeenCalledWith(
        { email: 'teacher1@test.com', name: 'Teacher 1' },
        undefined
      );
      expect(repository.upsert).toHaveBeenCalledWith(
        { email: 'teacher2@test.com', name: 'Teacher 2' },
        undefined
      );
    });

    it('should handle empty array', async () => {
      await repository.bulkUpsert([]);

      expect(repository.upsert).not.toHaveBeenCalled();
    });

    it('should handle multiple upserts in parallel', async () => {
      const teachers = [
        { email: 'teacher1@test.com', name: 'Teacher 1' },
        { email: 'teacher2@test.com', name: 'Teacher 2' },
        { email: 'teacher3@test.com', name: 'Teacher 3' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(teachers);

      expect(repository.upsert).toHaveBeenCalledTimes(3);
    });
  });
});
