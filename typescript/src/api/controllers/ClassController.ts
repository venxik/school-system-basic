import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '@config/logger';
import { classService } from '@services';

const ClassController = Express.Router();
const LOG = new Logger('ClassController');

const updateClassNameHandler: RequestHandler = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const { className } = req.body;

    if (!className || typeof className !== 'string') {
      LOG.error('Invalid className in request body');
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'className is required and must be a string',
      });
    }

    LOG.info(`Updating class name for ${classCode} to ${className}`);

    await classService.updateClassName(classCode, className);

    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    LOG.error('Error updating class name', error);
    next(error);
  }
};

ClassController.put('/class/:classCode', updateClassNameHandler);

export default ClassController;
