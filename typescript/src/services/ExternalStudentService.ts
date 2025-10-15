import axios from 'axios';
import Logger from '@config/logger';

const LOG = new Logger('ExternalStudentService');

const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_API_URL || 'http://localhost:8080';

export interface ExternalStudent {
  id: number;
  name: string;
  email: string;
}

export interface ExternalStudentResponse {
  count: number;
  students: ExternalStudent[];
}

export class ExternalStudentService {
  async fetchStudents(
    classCode: string,
    offset: number,
    limit: number
  ): Promise<ExternalStudentResponse> {
    try {
      const response = await axios.get<ExternalStudentResponse>(
        `${EXTERNAL_API_BASE_URL}/students`,
        {
          params: {
            class: classCode,
            offset,
            limit,
          },
        }
      );

      return response.data;
    } catch (error) {
      LOG.error(
        `Error fetching external students for class ${classCode}`,
        error
      );
      throw error;
    }
  }
}

export default new ExternalStudentService();
