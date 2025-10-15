import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '@config/logger';
import upload from '@middleware/multer';
import {
  transaction as queryTransaction,
  TTransaction,
} from '@database/repositories';
import { dataUploadService } from '@services';
import { convertCsvToJson, validateCsvData } from '@shared/index';

const UploadDataController = Express.Router();
const LOG = new Logger('UploadDataController');

export const uploadDataHandler: RequestHandler = async (req, res, next) => {
  let transaction: TTransaction | null = null;
  try {
    const { file } = req;

    if (!file) {
      LOG.error('No file uploaded');
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'No file uploaded',
      });
    }

    LOG.info(`Processing file upload: ${file.originalname}`);
    const data = await convertCsvToJson(file.path);

    if (!data || data.length === 0) {
      LOG.warn('CSV file is empty');
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'CSV file is empty',
      });
    }

    const validationErrors = validateCsvData(data);
    if (validationErrors.length > 0) {
      LOG.error(`CSV validation failed with ${validationErrors.length} errors`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid CSV data',
        details: validationErrors.slice(0, 10),
        totalErrors: validationErrors.length,
      });
    }

    transaction = await queryTransaction.beginTransaction();

    await dataUploadService.processData(data, transaction);
    await queryTransaction.commit(transaction);

    LOG.info(`Successfully processed ${data.length} rows`);

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    if (transaction) {
      await queryTransaction.rollback(transaction);
    }
    LOG.error('Error processing data upload', error);
    next(error);
  }
};

UploadDataController.post('/upload', upload.single('data'), uploadDataHandler);

export default UploadDataController;
