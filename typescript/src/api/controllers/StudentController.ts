import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '@config/logger';
import { studentListingService } from '@services';

const StudentController = Express.Router();
const LOG = new Logger('StudentController');

const getStudentsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const offsetParam = parseInt(req.query.offset as string);
    const limitParam = parseInt(req.query.limit as string);

    const offset = isNaN(offsetParam) ? 0 : offsetParam;
    const limit = isNaN(limitParam) ? 10 : limitParam;

    if (offset < 0 || limit <= 0) {
      LOG.error('Invalid offset or limit values');
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid offset or limit values',
      });
    }

    LOG.info(
      `Fetching students for class ${classCode}, offset: ${offset}, limit: ${limit}`
    );

    const result = await studentListingService.getStudents(
      classCode,
      offset,
      limit
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    LOG.error('Error fetching students', error);
    next(error);
  }
};

StudentController.get('/class/:classCode/students', getStudentsHandler);

export default StudentController;
