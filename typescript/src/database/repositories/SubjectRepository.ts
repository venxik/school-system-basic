import { Transaction, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Subject } from '@models';

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super(Subject as ModelCtor<Subject>);
  }

  async findByCodes(
    codes: string[],
    transaction?: Transaction
  ): Promise<Subject[]> {
    return this.findAll({ where: { code: codes }, transaction });
  }

  async bulkUpsert(
    subjects: Array<{ code: string; name: string }>,
    transaction?: Transaction
  ): Promise<void> {
    const promises = subjects.map((subject) =>
      this.upsert(subject, transaction)
    );
    await Promise.all(promises);
  }
}

export default new SubjectRepository();
