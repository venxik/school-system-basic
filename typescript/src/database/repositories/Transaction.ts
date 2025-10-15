import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import { TTransaction, ITransaction } from './types/ITransaction';

class SequelizeUnitOfWork implements ITransaction {
  public async beginTransaction(): Promise<TTransaction> {
    const transaction = await sequelize.transaction();
    return transaction;
  }

  public async commit(transaction: TTransaction): Promise<void> {
    await (transaction as Transaction).commit();
  }

  public async rollback(transaction: TTransaction): Promise<void> {
    await (transaction as Transaction).rollback();
  }
}

export const transaction = new SequelizeUnitOfWork();
