import { Transaction, WhereOptions } from 'sequelize';

export interface IRepository<T> {
  findOne(options: {
    where: WhereOptions;
    transaction?: Transaction;
    include?: unknown;
  }): Promise<T | null>;

  findAll(options?: {
    where?: WhereOptions;
    transaction?: Transaction;
    include?: unknown;
    limit?: number;
    offset?: number;
    order?: unknown;
    attributes?: unknown;
  }): Promise<T[]>;

  create(data: Partial<T>, transaction?: Transaction): Promise<T>;

  update(instance: T, transaction?: Transaction): Promise<T>;

  delete(instance: T, transaction?: Transaction): Promise<void>;

  upsert(data: Partial<T>, transaction?: Transaction): Promise<[T, boolean]>;

  destroy(options: {
    where: WhereOptions;
    transaction?: Transaction;
  }): Promise<number>;
}
