jest.mock('@models', () => ({
  Subject: {},
}));

import { SubjectRepository } from '../SubjectRepository';
import { Subject } from '@models';

describe('SubjectRepository', () => {
  let repository: SubjectRepository;

  beforeEach(() => {
    repository = new SubjectRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByCodes', () => {
    it('should find multiple subjects by codes', async () => {
      const mockSubjects = [
        { id: 1, code: 'MATH', name: 'Mathematics' },
        { id: 2, code: 'ENG', name: 'English' },
      ] as Subject[];
      (repository.findAll as jest.Mock).mockResolvedValue(mockSubjects);

      const result = await repository.findByCodes(['MATH', 'ENG']);

      expect(result).toEqual(mockSubjects);
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { code: ['MATH', 'ENG'] },
        transaction: undefined,
      });
    });

    it('should return empty array when no subjects found', async () => {
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByCodes(['NONEXISTENT']);

      expect(result).toEqual([]);
    });
  });

  describe('bulkUpsert', () => {
    it('should bulk upsert subjects', async () => {
      const subjects = [
        { code: 'MATH', name: 'Mathematics' },
        { code: 'ENG', name: 'English' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(subjects);

      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert).toHaveBeenCalledWith(
        { code: 'MATH', name: 'Mathematics' },
        undefined
      );
      expect(repository.upsert).toHaveBeenCalledWith(
        { code: 'ENG', name: 'English' },
        undefined
      );
    });

    it('should handle empty array', async () => {
      await repository.bulkUpsert([]);

      expect(repository.upsert).not.toHaveBeenCalled();
    });

    it('should handle multiple upserts in parallel', async () => {
      const subjects = [
        { code: 'MATH', name: 'Mathematics' },
        { code: 'ENG', name: 'English' },
        { code: 'SCI', name: 'Science' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(subjects);

      expect(repository.upsert).toHaveBeenCalledTimes(3);
    });
  });
});
