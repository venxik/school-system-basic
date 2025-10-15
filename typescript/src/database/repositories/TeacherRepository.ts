import { Transaction, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Teacher } from '@models';

export class TeacherRepository extends BaseRepository<Teacher> {
  constructor() {
    super(Teacher as ModelCtor<Teacher>);
  }

  async findByEmails(
    emails: string[],
    transaction?: Transaction
  ): Promise<Teacher[]> {
    return this.findAll({ where: { email: emails }, transaction });
  }

  async bulkUpsert(
    teachers: Array<{ email: string; name: string }>,
    transaction?: Transaction
  ): Promise<void> {
    const promises = teachers.map((teacher) =>
      this.upsert(teacher, transaction)
    );
    await Promise.all(promises);
  }
}

export default new TeacherRepository();
