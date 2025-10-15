/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@models', () => ({
  Class: {},
}));

import { ClassRepository } from '../ClassRepository';
import { Class } from '@models';

describe('ClassRepository', () => {
  let repository: ClassRepository;

  beforeEach(() => {
    repository = new ClassRepository();

    jest.spyOn(repository, 'findOne').mockImplementation(jest.fn());
    jest.spyOn(repository, 'findAll').mockImplementation(jest.fn());
    jest.spyOn(repository, 'upsert').mockImplementation(jest.fn());
    jest.spyOn(repository, 'update').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByCode', () => {
    it('should find a class by code', async () => {
      const mockClass = { id: 1, code: 'P1-1', name: 'Primary 1-1' } as Class;
      (repository.findOne as jest.Mock).mockResolvedValue(mockClass);

      const result = await repository.findByCode('P1-1');

      expect(result).toEqual(mockClass);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: 'P1-1' },
        transaction: undefined,
      });
    });

    it('should return null when class not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByCode('NONEXISTENT');

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: 'NONEXISTENT' },
        transaction: undefined,
      });
    });
  });

  describe('findByCodes', () => {
    it('should find multiple classes by codes', async () => {
      const mockClasses = [
        { id: 1, code: 'P1-1', name: 'Primary 1-1' },
        { id: 2, code: 'P1-2', name: 'Primary 1-2' },
      ] as Class[];
      (repository.findAll as jest.Mock).mockResolvedValue(mockClasses);

      const result = await repository.findByCodes(['P1-1', 'P1-2']);

      expect(result).toEqual(mockClasses);
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { code: ['P1-1', 'P1-2'] },
        transaction: undefined,
      });
    });

    it('should return empty array when no classes found', async () => {
      (repository.findAll as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByCodes(['NONEXISTENT']);

      expect(result).toEqual([]);
    });
  });

  describe('bulkUpsert', () => {
    it('should bulk upsert classes', async () => {
      const classes = [
        { code: 'P1-1', name: 'Primary 1-1' },
        { code: 'P1-2', name: 'Primary 1-2' },
      ];
      (repository.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await repository.bulkUpsert(classes);

      expect(repository.upsert).toHaveBeenCalledTimes(2);
      expect(repository.upsert).toHaveBeenCalledWith(
        { code: 'P1-1', name: 'Primary 1-1' },
        undefined
      );
      expect(repository.upsert).toHaveBeenCalledWith(
        { code: 'P1-2', name: 'Primary 1-2' },
        undefined
      );
    });

    it('should handle empty array', async () => {
      await repository.bulkUpsert([]);

      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });

  describe('updateNameByCode', () => {
    it('should update class name by code', async () => {
      const mockClass = {
        id: 1,
        code: 'P1-1',
        name: 'Old Name',
      } as Class;
      const updatedClass = { ...mockClass, name: 'New Name' } as Class;

      (repository.findOne as jest.Mock).mockResolvedValue(mockClass);
      (repository.update as jest.Mock).mockResolvedValue(updatedClass);

      const result = await repository.updateNameByCode('P1-1', 'New Name');

      expect(mockClass.name).toBe('New Name');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { code: 'P1-1' },
        transaction: undefined,
      });
      expect(repository.update).toHaveBeenCalledWith(mockClass, undefined);
      expect(result).toEqual(updatedClass);
    });

    it('should throw error when class not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        repository.updateNameByCode('NONEXISTENT', 'New Name')
      ).rejects.toThrow('Class NONEXISTENT not found');
    });
  });
});
