import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import ErrorBase from '@shared/errors/ErrorBase';
import ErrorCodes from '@shared/constants/ErrorCodes';

const FILE_LIMIT = 5 * 1024 * 1024; // 5 MB

const diskStorage = multer.diskStorage({
  destination: '/tmp/school-administration-system-uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (
    file.mimetype === 'text/csv' ||
    file.originalname.toLowerCase().endsWith('.csv')
  ) {
    callback(null, true);
  } else {
    const error = new ErrorBase(
      'Invalid file type. Only .csv files are allowed.',
      ErrorCodes.INVALID_FILE_TYPE_ERROR_CODE,
      StatusCodes.BAD_REQUEST
    );
    callback(error);
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_LIMIT,
  },
});

export default upload;
