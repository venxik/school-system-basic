jest.mock('@services');

import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import ClassController from '../ClassController';
import { classService } from '@services';

const mockedClassService = classService as jest.Mocked<typeof classService>;

const app = express();
app.use(express.json());
app.use('/api', ClassController);

describe('ClassController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/class/:classCode', () => {
    it('should update class name successfully', async () => {
      mockedClassService.updateClassName.mockResolvedValue(undefined);

      const response = await request(app)
        .put('/api/class/P1-1')
        .send({ className: 'Primary 1 Class A' });

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
      expect(mockedClassService.updateClassName).toHaveBeenCalledWith(
        'P1-1',
        'Primary 1 Class A'
      );
    });

    it('should return 400 when className is missing', async () => {
      const response = await request(app).put('/api/class/P1-1').send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe(
        'className is required and must be a string'
      );
      expect(mockedClassService.updateClassName).not.toHaveBeenCalled();
    });

    it('should return 400 when className is not a string', async () => {
      const response = await request(app)
        .put('/api/class/P1-1')
        .send({ className: 123 });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.error).toBe(
        'className is required and must be a string'
      );
      expect(mockedClassService.updateClassName).not.toHaveBeenCalled();
    });
  });
});
