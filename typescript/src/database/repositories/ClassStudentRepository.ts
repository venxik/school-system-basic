import { Transaction, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { ClassStudent } from '@models';

export class ClassStudentRepository extends BaseRepository<ClassStudent> {
  constructor() {
    super(ClassStudent as ModelCtor<ClassStudent>);
  }

  async findOrCreateData(
    classId: number,
    studentId: number,
    transaction?: Transaction
  ): Promise<[ClassStudent, boolean]> {
    return this.upsert({ classId, studentId }, transaction);
  }

  async deleteByRelationship(
    classId: number,
    studentId: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const count = await this.destroy({
      where: { classId, studentId },
      transaction,
    });
    return count > 0;
  }
}

export default new ClassStudentRepository();
