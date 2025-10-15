import { classRepository } from '@repositories';
import Logger from '@config/logger';

const LOG = new Logger('ClassService');

export class ClassService {
  async updateClassName(
    classCode: string,
    newClassName: string
  ): Promise<void> {
    try {
      await classRepository.updateNameByCode(classCode, newClassName);
      LOG.info(`Updated class name for ${classCode} to ${newClassName}`);
    } catch (error) {
      LOG.error(`Error updating class name for ${classCode}`, error);
      throw error;
    }
  }
}

export default new ClassService();
