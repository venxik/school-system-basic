jest.mock('@services');

import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import ReportController from '../ReportController';
import { workloadReportService } from '@services';

const mockedWorkloadReportService = workloadReportService as jest.Mocked<
  typeof workloadReportService
>;

const app = express();
app.use('/api', ReportController);

describe('ReportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports/workload', () => {
    it('should return workload report successfully', async () => {
      const mockReport = {
        'Teacher One': [
          {
            subjectCode: 'MATH',
            subjectName: 'Mathematics',
            numberOfClasses: 2,
          },
          {
            subjectCode: 'ENG',
            subjectName: 'English',
            numberOfClasses: 1,
          },
        ],
        'Teacher Two': [
          {
            subjectCode: 'ENG',
            subjectName: 'English',
            numberOfClasses: 1,
          },
        ],
      };

      mockedWorkloadReportService.generateReport.mockResolvedValue(mockReport);

      const response = await request(app).get('/api/reports/workload');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockReport);
      expect(mockedWorkloadReportService.generateReport).toHaveBeenCalledTimes(
        1
      );
    });

    it('should return empty report when no teachers exist', async () => {
      mockedWorkloadReportService.generateReport.mockResolvedValue({});

      const response = await request(app).get('/api/reports/workload');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({});
      expect(mockedWorkloadReportService.generateReport).toHaveBeenCalledTimes(
        1
      );
    });
  });
});
