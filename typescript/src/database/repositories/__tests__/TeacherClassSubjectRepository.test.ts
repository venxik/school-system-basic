jest.mock('@models', () => ({
  TeacherClassSubject: {},
  Teacher: {},
  Subject: {},
  Class: {},
}));

import { TeacherClassSubjectRepository } from '../TeacherClassSubjectRepository';
import { TeacherClassSubject, Teacher, Subject, Class } from '@models';

describe('TeacherClassSubjectRepository', () => {
  let repository: TeacherClassSubjectRepository;

  beforeEach(() => {
    repository = new TeacherClassSubjectRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'delete').mockImplementation(jest.fn());
    jest.spyOn(repository, 'create').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('findAllWithDetails', () => {
    it('should find all relationships with teacher, subject, and class details', async () => {
      const mockRelations = [
        { id: 1, teacherId: 1, classId: 1, subjectId: 1 },
        { id: 2, teacherId: 2, classId: 2, subjectId: 2 },
      ] as TeacherClassSubject[];
      (repository.findAll as jest.Mock).mockResolvedValue(mockRelations);

      const result = await repository.findAllWithDetails();

      expect(result).toEqual(mockRelations);
      expect(repository.findAll).toHaveBeenCalledWith({
        include: [
          { model: Teacher, attributes: ['id', 'name'] },
          { model: Subject, attributes: ['id', 'code', 'name'] },
          { model: Class, attributes: ['id'] },
        ],
        transaction: undefined,
      });
    });
  });

  describe('findByRelationship', () => {
    it('should find a relationship by teacher, class, and subject IDs', async () => {
      const mockRelation = {
        id: 1,
        teacherId: 1,
        classId: 2,
        subjectId: 3,
      } as TeacherClassSubject;
      (repository.findOne as jest.Mock).mockResolvedValue(mockRelation);

      const result = await repository.findByRelationship(1, 2, 3);

      expect(result).toEqual(mockRelation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { teacherId: 1, classId: 2, subjectId: 3 },
        transaction: undefined,
      });
    });

    it('should return null when relationship not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByRelationship(1, 999, 999);

      expect(result).toBeNull();
    });
  });

  describe('findOrCreateRelationship', () => {
    it('should create new relationship when it does not exist', async () => {
      const newRelation = {
        id: 1,
        teacherId: 1,
        classId: 2,
        subjectId: 3,
      } as TeacherClassSubject;
      (repository.upsert as jest.Mock).mockResolvedValue([newRelation, true]);

      const [result, created] = await repository.findOrCreateRelationship(
        1,
        2,
        3
      );

      expect(result).toEqual(newRelation);
      expect(created).toBe(true);
      expect(repository.upsert).toHaveBeenCalledWith(
        { teacherId: 1, classId: 2, subjectId: 3 },
        undefined
      );
    });

    it('should return existing relationship when it already exists', async () => {
      const existingRelation = {
        id: 1,
        teacherId: 1,
        classId: 2,
        subjectId: 3,
      } as TeacherClassSubject;
      (repository.upsert as jest.Mock).mockResolvedValue([
        existingRelation,
        false,
      ]);

      const [result, created] = await repository.findOrCreateRelationship(
        1,
        2,
        3
      );

      expect(result).toEqual(existingRelation);
      expect(created).toBe(false);
      expect(repository.upsert).toHaveBeenCalledWith(
        { teacherId: 1, classId: 2, subjectId: 3 },
        undefined
      );
    });
  });

  describe('deleteByRelationship', () => {
    it('should delete relationship and return true when found', async () => {
      const existingRelation = {
        id: 1,
        teacherId: 1,
        classId: 2,
        subjectId: 3,
      } as TeacherClassSubject;
      (repository.findOne as jest.Mock).mockResolvedValue(existingRelation);
      (repository.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.deleteByRelationship(1, 2, 3);

      expect(result).toBe(true);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { teacherId: 1, classId: 2, subjectId: 3 },
        transaction: undefined,
      });
      expect(repository.delete).toHaveBeenCalledWith(
        existingRelation,
        undefined
      );
    });

    it('should return false when relationship not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.deleteByRelationship(1, 999, 999);

      expect(result).toBe(false);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
