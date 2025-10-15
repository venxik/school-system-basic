import Express from 'express';
import UploadDataController from '@controllers/UploadDataController';
import HealthcheckController from '@controllers/HealthcheckController';
import StudentController from '@controllers/StudentController';
import ClassController from '@controllers/ClassController';
import ReportController from '@controllers/ReportController';

const router = Express.Router();

router.use('/', UploadDataController);
router.use('/', HealthcheckController);
router.use('/', StudentController);
router.use('/', ClassController);
router.use('/', ReportController);

export default router;
