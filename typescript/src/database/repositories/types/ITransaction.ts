import { Transaction } from 'sequelize';

export type TTransaction = Transaction;

export interface ITransaction {
  beginTransaction(): Promise<TTransaction>;
  commit(transaction: TTransaction): Promise<void>;
  rollback(transaction: TTransaction): Promise<void>;
}
