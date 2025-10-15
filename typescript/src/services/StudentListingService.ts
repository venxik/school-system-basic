import { classRepository, studentRepository } from '@repositories';
import { ClassStudent, Student } from '@models';
import ExternalStudentService, {
  ExternalStudent,
} from './ExternalStudentService';
import Logger from '@config/logger';
import ErrorBase from '@shared/errors/ErrorBase';
import ErrorCodes from '@shared/constants/ErrorCodes';
import { StatusCodes } from 'http-status-codes';

const LOG = new Logger('StudentListingService');

interface StudentData {
  id?: number;
  name: string;
  email: string;
}

export interface StudentListingResponse {
  count: number;
  students: StudentData[];
}

export class StudentListingService {
  private mergeAndSortStudents(
    localStudents: StudentData[],
    externalStudents: ExternalStudent[]
  ): StudentData[] {
    const allStudents = [...localStudents, ...externalStudents];

    return allStudents.sort((a, b) => a.email.localeCompare(b.email));
  }

  async getStudents(
    classCode: string,
    offset: number,
    limit: number
  ): Promise<StudentListingResponse> {
    try {
      const classEntity = await classRepository.findByCode(classCode);

      if (!classEntity) {
        throw new ErrorBase(
          `Class ${classCode} not found`,
          ErrorCodes.RECORD_NOT_FOUND,
          StatusCodes.BAD_REQUEST
        );
      }

      const localStudents = await studentRepository.findAll({
        include: [
          {
            model: ClassStudent,
            where: { classId: classEntity.id },
            attributes: [],
          },
        ],
        attributes: ['id', 'name', 'email'],
      });

      const localStudentData: StudentData[] = localStudents.map(
        (s: Student) => ({
          id: s.id,
          name: s.name,
          email: s.email,
        })
      );

      let allExternalStudents: ExternalStudent[] = [];
      let externalOffset = 0;
      const externalBatchSize = 100;
      let hasMore = true;

      while (hasMore) {
        const externalResponse = await ExternalStudentService.fetchStudents(
          classCode,
          externalOffset,
          externalBatchSize
        );

        allExternalStudents = [
          ...allExternalStudents,
          ...externalResponse.students,
        ];
        externalOffset += externalBatchSize;

        if (externalResponse.students.length < externalBatchSize) {
          hasMore = false;
        }
      }

      const sortedStudents = this.mergeAndSortStudents(
        localStudentData,
        allExternalStudents
      );

      const paginatedStudents = sortedStudents.slice(offset, offset + limit);

      return {
        count: sortedStudents.length,
        students: paginatedStudents,
      };
    } catch (error) {
      LOG.error(`Error getting students for class ${classCode}`, error);
      throw error;
    }
  }
}

export default new StudentListingService();
