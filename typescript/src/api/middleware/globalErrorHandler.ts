import ErrorCodes from '@constants/ErrorCodes';
import ErrorBase from '@errors/ErrorBase';
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(StatusCodes.BAD_REQUEST).send({
      errorCode: ErrorCodes.MALFORMED_JSON_ERROR_CODE,
      message: 'Malformed json',
    });
  }

  if (err instanceof ErrorBase) {
    const error = err;

    return res.status(error.getHttpStatusCode()).send({
      errorCode: error.getErrorCode(),
      message: error.getMessage(),
    });
  } else {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      errorCode: ErrorCodes.RUNTIME_ERROR_CODE,
      message: 'Internal Server Error',
    });
  }
};

export default globalErrorHandler;
