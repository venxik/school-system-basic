import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '@config/logger';
import { workloadReportService } from '@services';

const ReportController = Express.Router();
const LOG = new Logger('ReportController');

const getWorkloadReportHandler: RequestHandler = async (req, res, next) => {
  try {
    LOG.info('Generating workload report');

    const report = await workloadReportService.generateReport();

    return res.status(StatusCodes.OK).json(report);
  } catch (error) {
    LOG.error('Error generating workload report', error);
    next(error);
  }
};

ReportController.get('/reports/workload', getWorkloadReportHandler);

export default ReportController;
