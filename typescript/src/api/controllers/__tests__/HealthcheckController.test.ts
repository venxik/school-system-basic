import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import HealthcheckController from '../HealthcheckController';

const app = express();
app.use('/api', HealthcheckController);

describe('HealthcheckController', () => {
  describe('GET /api/healthcheck', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/api/healthcheck');

      expect(response.status).toBe(StatusCodes.OK);
    });
  });
});
