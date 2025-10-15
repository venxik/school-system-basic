jest.mock('@models', () => ({
  ClassStudent: {},
}));

import { ClassStudentRepository } from '../ClassStudentRepository';
import { ClassStudent } from '@models';

describe('ClassStudentRepository', () => {
  let repository: ClassStudentRepository;

  beforeEach(() => {
    repository = new ClassStudentRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'create').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
    jest.spyOn(repository, 'destroy').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findOrCreateData', () => {
    it('should return existing relationship when found', async () => {
      const existingRelation = {
        id: 1,
        classId: 1,
        studentId: 2,
      } as ClassStudent;
      (repository.upsert as jest.Mock).mockResolvedValue([
        existingRelation,
        false,
      ]);

      const [result, created] = await repository.findOrCreateData(1, 2);

      expect(result).toEqual(existingRelation);
      expect(created).toBe(false);
      expect(repository.upsert).toHaveBeenCalledWith(
        { classId: 1, studentId: 2 },
        undefined
      );
    });

    it('should create new relationship when not found', async () => {
      const newRelation = { id: 1, classId: 1, studentId: 2 } as ClassStudent;
      (repository.upsert as jest.Mock).mockResolvedValue([newRelation, true]);

      const [result, created] = await repository.findOrCreateData(1, 2);

      expect(result).toEqual(newRelation);
      expect(created).toBe(true);
      expect(repository.upsert).toHaveBeenCalledWith(
        { classId: 1, studentId: 2 },
        undefined
      );
    });
  });

  describe('deleteByRelationship', () => {
    it('should delete relationship and return true when found', async () => {
      (repository.destroy as jest.Mock).mockResolvedValue(1);

      const result = await repository.deleteByRelationship(1, 2);

      expect(result).toBe(true);
      expect(repository.destroy).toHaveBeenCalledWith({
        where: { classId: 1, studentId: 2 },
        transaction: undefined,
      });
    });

    it('should return false when relationship not found', async () => {
      (repository.destroy as jest.Mock).mockResolvedValue(0);

      const result = await repository.deleteByRelationship(1, 999);

      expect(result).toBe(false);
    });
  });
});
