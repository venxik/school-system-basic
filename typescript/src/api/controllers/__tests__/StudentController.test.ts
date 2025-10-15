jest.mock('@services');

import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import StudentController from '../StudentController';
import { studentListingService } from '@services';

const mockedStudentListingService = studentListingService as jest.Mocked<
  typeof studentListingService
>;

const app = express();
app.use('/api', StudentController);

describe('StudentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/class/:classCode/students', () => {
    it('should return students successfully with default pagination', async () => {
      const mockResponse = {
        count: 3,
        students: [
          { id: 1, name: 'Alice', email: 'alice@test.com' },
          { id: 2, name: 'Bob', email: 'bob@test.com' },
          { id: 3, name: 'Charlie', email: 'charlie@test.com' },
        ],
      };

      mockedStudentListingService.getStudents.mockResolvedValue(mockResponse);

      const response = await request(app).get('/api/class/P1-1/students');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockResponse);
      expect(mockedStudentListingService.getStudents).toHaveBeenCalledWith(
        'P1-1',
        0,
        10
      );
    });

    it('should use custom offset and limit from query params', async () => {
      const mockResponse = {
        count: 50,
        students: [
          { id: 21, name: 'Student 21', email: 'student21@test.com' },
          { id: 22, name: 'Student 22', email: 'student22@test.com' },
        ],
      };

      mockedStudentListingService.getStudents.mockResolvedValue(mockResponse);

      const response = await request(app).get(
        '/api/class/P1-1/students?offset=20&limit=2'
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockResponse);
      expect(mockedStudentListingService.getStudents).toHaveBeenCalledWith(
        'P1-1',
        20,
        2
      );
    });

    it('should return 400 for negative offset', async () => {
      const response = await request(app).get(
        '/api/class/P1-1/students?offset=-1&limit=10'
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe('Invalid offset or limit values');
      expect(mockedStudentListingService.getStudents).not.toHaveBeenCalled();
    });

    it('should return 400 for zero or negative limit', async () => {
      const response = await request(app).get(
        '/api/class/P1-1/students?offset=0&limit=0'
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe('Invalid offset or limit values');
      expect(mockedStudentListingService.getStudents).not.toHaveBeenCalled();
    });

    it('should return 400 for negative limit', async () => {
      const response = await request(app).get(
        '/api/class/P1-1/students?offset=0&limit=-5'
      );

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe('Invalid offset or limit values');
      expect(mockedStudentListingService.getStudents).not.toHaveBeenCalled();
    });

    it('should handle non-numeric query params by using defaults', async () => {
      const mockResponse: {
        count: number;
        students: Array<{ id?: number; name: string; email: string }>;
      } = {
        count: 0,
        students: [],
      };

      mockedStudentListingService.getStudents.mockResolvedValue(mockResponse);

      const response = await request(app).get(
        '/api/class/P1-1/students?offset=abc&limit=xyz'
      );

      expect(response.status).toBe(StatusCodes.OK);
      expect(mockedStudentListingService.getStudents).toHaveBeenCalledWith(
        'P1-1',
        0,
        10
      );
    });

    it('should return empty array when no students exist', async () => {
      const mockResponse: {
        count: number;
        students: Array<{ id?: number; name: string; email: string }>;
      } = {
        count: 0,
        students: [],
      };

      mockedStudentListingService.getStudents.mockResolvedValue(mockResponse);

      const response = await request(app).get('/api/class/P2-5/students');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockResponse);
    });
  });
});
