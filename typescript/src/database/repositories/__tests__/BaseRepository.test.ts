/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, ModelCtor } from 'sequelize';
import { BaseRepository } from '../BaseRepository';

class TestModel extends Model {
  public id!: number;
  public name!: string;
}

class TestRepository extends BaseRepository<TestModel> {
  constructor(model: ModelCtor<TestModel>) {
    super(model);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockModel: jest.Mocked<ModelCtor<TestModel>>;

  beforeEach(() => {
    mockModel = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      bulkCreate: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
    } as any;

    repository = new TestRepository(mockModel);
  });

  describe('findOne', () => {
    it('should find one record by where condition', async () => {
      const mockResult = { id: 1, name: 'Test' } as TestModel;
      mockModel.findOne.mockResolvedValue(mockResult);

      const result = await repository.findOne({ where: { id: 1 } });

      expect(result).toEqual(mockResult);
      expect(mockModel.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when no record found', async () => {
      mockModel.findOne.mockResolvedValue(null);

      const result = await repository.findOne({ where: { id: 999 } });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all records', async () => {
      const mockResults = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ] as TestModel[];
      mockModel.findAll.mockResolvedValue(mockResults);

      const results = await repository.findAll();

      expect(results).toEqual(mockResults);
      expect(mockModel.findAll).toHaveBeenCalled();
    });

    it('should support where condition', async () => {
      const mockResults = [{ id: 1, name: 'Test' }] as TestModel[];
      mockModel.findAll.mockResolvedValue(mockResults);

      await repository.findAll({ where: { name: 'Test' } });

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { name: 'Test' },
      });
    });
  });

  describe('findById', () => {
    it('should find record by primary key', async () => {
      const mockResult = { id: 1, name: 'Test' } as TestModel;
      mockModel.findByPk.mockResolvedValue(mockResult);

      const result = await repository.findById(1);

      expect(result).toEqual(mockResult);
      expect(mockModel.findByPk).toHaveBeenCalledWith(1, {});
    });

    it('should return null when not found', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const newData = { name: 'New Test' };
      const mockResult = { id: 1, name: 'New Test' } as TestModel;
      (mockModel.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await repository.create(newData);

      expect(result).toEqual(mockResult);
      expect(mockModel.create).toHaveBeenCalledWith(newData, {});
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const mockInstance = {
        id: 1,
        name: 'Updated',
        save: jest.fn().mockResolvedValue(undefined),
      } as any;

      const result = await repository.update(mockInstance);

      expect(mockInstance.save).toHaveBeenCalledWith({});
      expect(result).toEqual(mockInstance);
    });
  });

  describe('delete', () => {
    it('should delete an instance', async () => {
      const mockInstance = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      } as any;

      await repository.delete(mockInstance);

      expect(mockInstance.destroy).toHaveBeenCalledWith({});
    });
  });

  describe('upsert', () => {
    it('should upsert a record', async () => {
      const data = { id: 1, name: 'Test' };
      const mockResult = [{ id: 1, name: 'Test' } as TestModel, true] as [
        TestModel,
        boolean
      ];
      mockModel.upsert.mockResolvedValue(mockResult);

      const result = await repository.upsert(data);

      expect(result).toEqual(mockResult);
      expect(mockModel.upsert).toHaveBeenCalledWith(data, {});
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple records', async () => {
      const data = [{ name: 'Test1' }, { name: 'Test2' }];
      const mockResults = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ] as TestModel[];
      mockModel.bulkCreate.mockResolvedValue(mockResults);

      const results = await repository.bulkCreate(data);

      expect(results).toEqual(mockResults);
      expect(mockModel.bulkCreate).toHaveBeenCalledWith(data, {});
    });
  });

  describe('destroy', () => {
    it('should destroy records matching where condition', async () => {
      mockModel.destroy.mockResolvedValue(3);

      const count = await repository.destroy({ where: { name: 'Test' } });

      expect(count).toBe(3);
      expect(mockModel.destroy).toHaveBeenCalledWith({
        where: { name: 'Test' },
      });
    });

    it('should return 0 when no records deleted', async () => {
      mockModel.destroy.mockResolvedValue(0);

      const count = await repository.destroy({ where: { id: 999 } });

      expect(count).toBe(0);
    });
  });

  describe('count', () => {
    it('should count all records', async () => {
      mockModel.count.mockResolvedValue(5);

      const count = await repository.count();

      expect(count).toBe(5);
      expect(mockModel.count).toHaveBeenCalled();
    });

    it('should count records matching where condition', async () => {
      mockModel.count.mockResolvedValue(2);

      const count = await repository.count({ where: { name: 'Test' } });

      expect(count).toBe(2);
      expect(mockModel.count).toHaveBeenCalledWith({ where: { name: 'Test' } });
    });
  });

  describe('exists', () => {
    it('should return true when records exist', async () => {
      mockModel.count.mockResolvedValue(1);

      const exists = await repository.exists({ where: { id: 1 } });

      expect(exists).toBe(true);
      expect(mockModel.count).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return false when no records exist', async () => {
      mockModel.count.mockResolvedValue(0);

      const exists = await repository.exists({ where: { id: 999 } });

      expect(exists).toBe(false);
    });
  });
});
