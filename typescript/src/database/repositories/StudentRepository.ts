import { Transaction, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Student } from '@models';

export class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super(Student as ModelCtor<Student>);
  }

  async findByEmails(
    emails: string[],
    transaction?: Transaction
  ): Promise<Student[]> {
    return this.findAll({ where: { email: emails }, transaction });
  }

  async bulkUpsert(
    students: Array<{ email: string; name: string }>,
    transaction?: Transaction
  ): Promise<void> {
    const promises = students.map((student) =>
      this.upsert(student, transaction)
    );
    await Promise.all(promises);
  }
}

export default new StudentRepository();
