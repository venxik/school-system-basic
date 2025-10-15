import { Transaction, ModelCtor } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { Class } from '@models';
import ErrorCodes from '@shared/constants/ErrorCodes';
import { StatusCodes } from 'http-status-codes';
import ErrorBase from '@shared/errors/ErrorBase';

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super(Class as ModelCtor<Class>);
  }

  async findByCode(
    code: string,
    transaction?: Transaction
  ): Promise<Class | null> {
    return this.findOne({ where: { code }, transaction });
  }

  async findByCodes(
    codes: string[],
    transaction?: Transaction
  ): Promise<Class[]> {
    return this.findAll({ where: { code: codes }, transaction });
  }

  async bulkUpsert(
    classes: Array<{ code: string; name: string }>,
    transaction?: Transaction
  ): Promise<void> {
    const promises = classes.map((classData) =>
      this.upsert(classData, transaction)
    );
    await Promise.all(promises);
  }

  async updateNameByCode(
    code: string,
    newName: string,
    transaction?: Transaction
  ): Promise<Class> {
    const classEntity = await this.findByCode(code, transaction);
    if (!classEntity) {
      throw new ErrorBase(
        `Class ${code} not found`,
        ErrorCodes.RECORD_NOT_FOUND,
        StatusCodes.BAD_REQUEST
      );
    }
    classEntity.name = newName;
    return this.update(classEntity, transaction);
  }
}

export default new ClassRepository();
