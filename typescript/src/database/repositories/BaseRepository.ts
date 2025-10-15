/* eslint-disable indent */
import {
  Model,
  ModelCtor,
  Transaction,
  WhereOptions,
  FindOptions,
  CreateOptions,
  DestroyOptions,
  Includeable,
  Order,
  FindAttributeOptions,
} from 'sequelize';
import { IRepository } from './types/IRepository';

export abstract class BaseRepository<T extends Model>
  implements IRepository<T>
{
  constructor(protected model: ModelCtor<T>) {}

  async findById(
    id: number | string,
    transaction?: Transaction
  ): Promise<T | null> {
    return this.model.findByPk(id, { transaction } as FindOptions);
  }

  async findOne(options: {
    where: WhereOptions;
    transaction?: Transaction;
    include?: Includeable | Includeable[];
  }): Promise<T | null> {
    return this.model.findOne(options as FindOptions);
  }

  async findAll(options?: {
    where?: WhereOptions;
    transaction?: Transaction;
    include?: Includeable | Includeable[];
    limit?: number;
    offset?: number;
    order?: Order;
    attributes?: FindAttributeOptions;
  }): Promise<T[]> {
    return this.model.findAll(options as FindOptions);
  }

  async create(data: Partial<T>, transaction?: Transaction): Promise<T> {
    const options = transaction ? { transaction } : {};
    return this.model.create(data, options as CreateOptions);
  }

  async bulkCreate(
    data: Partial<T>[],
    transaction?: Transaction
  ): Promise<T[]> {
    const options = transaction ? { transaction } : {};
    return this.model.bulkCreate(data, options as CreateOptions);
  }

  async update(instance: T, transaction?: Transaction): Promise<T> {
    const options = transaction ? { transaction } : {};
    await instance.save(options);
    return instance;
  }

  async delete(instance: T, transaction?: Transaction): Promise<void> {
    const options = transaction ? { transaction } : {};
    await instance.destroy(options);
  }

  async upsert(
    data: Partial<T>,
    transaction?: Transaction
  ): Promise<[T, boolean]> {
    const options = transaction ? { transaction } : {};
    const result = await this.model.upsert(data, options);
    return result as [T, boolean];
  }

  async destroy(options: {
    where: WhereOptions;
    transaction?: Transaction;
  }): Promise<number> {
    return this.model.destroy(options as DestroyOptions);
  }

  async count(options?: {
    where?: WhereOptions;
    transaction?: Transaction;
  }): Promise<number> {
    const result = await this.model.count(options as FindOptions);
    return typeof result === 'number' ? result : 0;
  }

  async exists(options: {
    where: WhereOptions;
    transaction?: Transaction;
  }): Promise<boolean> {
    const count = await this.count(options);
    return count > 0;
  }
}
