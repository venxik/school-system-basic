import { Transaction, Includeable, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { TeacherClassSubject, Teacher, Subject, Class } from '@models';

export class TeacherClassSubjectRepository extends BaseRepository<TeacherClassSubject> {
  constructor() {
    super(TeacherClassSubject as ModelCtor<TeacherClassSubject>);
  }

  async findAllWithDetails(
    transaction?: Transaction
  ): Promise<TeacherClassSubject[]> {
    return this.findAll({
      include: [
        {
          model: Teacher,
          attributes: ['id', 'name'],
        },
        {
          model: Subject,
          attributes: ['id', 'code', 'name'],
        },
        {
          model: Class,
          attributes: ['id'],
        },
      ] as Includeable[],
      transaction,
    });
  }

  async findByRelationship(
    teacherId: number,
    classId: number,
    subjectId: number,
    transaction?: Transaction
  ): Promise<TeacherClassSubject | null> {
    return this.findOne({
      where: { teacherId, classId, subjectId },
      transaction,
    });
  }

  async findOrCreateRelationship(
    teacherId: number,
    classId: number,
    subjectId: number,
    transaction?: Transaction
  ): Promise<[TeacherClassSubject, boolean]> {
    return await this.upsert({ teacherId, classId, subjectId }, transaction);
  }

  async deleteByRelationship(
    teacherId: number,
    classId: number,
    subjectId: number,
    transaction?: Transaction
  ): Promise<boolean> {
    const existing = await this.findByRelationship(
      teacherId,
      classId,
      subjectId,
      transaction
    );
    if (existing) {
      await this.delete(existing, transaction);
      return true;
    }
    return false;
  }
}

export default new TeacherClassSubjectRepository();
