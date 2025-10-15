/* eslint-disable quotes */
jest.mock('@services');
jest.mock('@shared/utils/convertCsvToJson');
jest.mock('@shared/utils/csvValidator');
jest.mock('@database/repositories');

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { dataUploadService } from '@services';
import { convertCsvToJson } from '@shared/utils/convertCsvToJson';
import { validateCsvData } from '@shared/utils/csvValidator';
import { transaction, TTransaction } from '@database/repositories';
import { CsvItem } from '@shared/types/CsvItem';
import { uploadDataHandler } from '../UploadDataController';

const mockedDataUploadService = dataUploadService as jest.Mocked<
  typeof dataUploadService
>;
const mockedConvertCsvToJson = convertCsvToJson as jest.MockedFunction<
  typeof convertCsvToJson
>;
const mockedValidateCsvData = validateCsvData as jest.MockedFunction<
  typeof validateCsvData
>;
const mockedTransaction = transaction as jest.Mocked<typeof transaction>;

describe('UploadDataController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockTransactionInstance: TTransaction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    // Create a mock that satisfies the Transaction type for type-checking
    mockTransactionInstance = {
      commit: jest.fn(),
      rollback: jest.fn(),
    } as unknown as TTransaction;

    // Mock the transaction methods
    mockedTransaction.beginTransaction.mockResolvedValue(
      mockTransactionInstance
    );
    mockedTransaction.commit.mockResolvedValue(undefined);
    mockedTransaction.rollback.mockResolvedValue(undefined);
  });

  describe('POST /api/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      mockRequest = {
        file: undefined,
      };

      await uploadDataHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No file uploaded',
      });
      expect(mockedDataUploadService.processData).not.toHaveBeenCalled();
    });

    it('should process CSV file successfully', async () => {
      const mockFile = {
        path: '/tmp/test.csv',
      } as Express.Multer.File;

      const mockCsvData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@test.com',
          teacherName: 'Teacher One',
          studentEmail: 'student1@test.com',
          studentName: 'Student One',
          classCode: 'P1-1',
          classname: 'Primary 1-1',
          subjectCode: 'MATH',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];

      mockRequest = { file: mockFile };

      mockedConvertCsvToJson.mockResolvedValue(mockCsvData);
      mockedValidateCsvData.mockReturnValue([]); // No validation errors
      mockedDataUploadService.processData.mockResolvedValue(undefined);

      await uploadDataHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedTransaction.beginTransaction).toHaveBeenCalled();
      expect(mockedConvertCsvToJson).toHaveBeenCalledWith(mockFile.path);
      expect(mockedValidateCsvData).toHaveBeenCalledWith(mockCsvData);
      expect(mockedDataUploadService.processData).toHaveBeenCalledWith(
        mockCsvData,
        mockTransactionInstance
      );
      expect(mockedTransaction.commit).toHaveBeenCalledWith(
        mockTransactionInstance
      );
      expect(mockedTransaction.rollback).not.toHaveBeenCalled();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(
        StatusCodes.NO_CONTENT
      );
    });

    it('should return 400 when CSV file is empty', async () => {
      const mockFile = { path: '/tmp/empty.csv' } as Express.Multer.File;
      mockRequest = { file: mockFile };

      mockedConvertCsvToJson.mockResolvedValue([]);

      await uploadDataHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'CSV file is empty',
      });
      expect(mockedDataUploadService.processData).not.toHaveBeenCalled();
      expect(mockedTransaction.beginTransaction).not.toHaveBeenCalled();
    });

    it('should return 400 when CSV validation fails', async () => {
      const mockFile = { path: '/tmp/invalid.csv' } as Express.Multer.File;
      const mockCsvData: CsvItem[] = [
        {
          teacherEmail: 'invalid-email',
          teacherName: 'Teacher One',
          studentEmail: 'student1@test.com',
          studentName: 'Student One',
          classCode: 'P1-1',
          classname: 'Primary 1-1',
          subjectCode: 'MATH',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];

      const validationErrors = [
        {
          row: 2,
          field: 'teacherEmail',
          value: 'invalid-email',
          message: "Invalid email format: 'invalid-email'",
        },
      ];

      mockRequest = { file: mockFile };

      mockedConvertCsvToJson.mockResolvedValue(mockCsvData);
      mockedValidateCsvData.mockReturnValue(validationErrors);

      await uploadDataHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid CSV data',
        details: validationErrors,
        totalErrors: 1,
      });
      expect(mockedDataUploadService.processData).not.toHaveBeenCalled();
      expect(mockedTransaction.beginTransaction).not.toHaveBeenCalled();
    });

    it('should handle service errors and rollback the transaction', async () => {
      const mockFile = { path: '/tmp/error.csv' } as Express.Multer.File;
      const mockCsvData: CsvItem[] = [
        {
          teacherEmail: 'teacher1@test.com',
          teacherName: 'Teacher One',
          studentEmail: 'student1@test.com',
          studentName: 'Student One',
          classCode: 'P1-1',
          classname: 'Primary 1-1',
          subjectCode: 'MATH',
          subjectName: 'Mathematics',
          toDelete: '0',
        },
      ];
      const dbError = new Error('Database error');

      mockRequest = { file: mockFile };

      mockedConvertCsvToJson.mockResolvedValue(mockCsvData);
      mockedValidateCsvData.mockReturnValue([]); // No validation errors
      mockedDataUploadService.processData.mockRejectedValue(dbError);

      await uploadDataHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockedTransaction.beginTransaction).toHaveBeenCalled();
      expect(mockedDataUploadService.processData).toHaveBeenCalledWith(
        mockCsvData,
        mockTransactionInstance
      );
      expect(mockedTransaction.commit).not.toHaveBeenCalled();
      expect(mockedTransaction.rollback).toHaveBeenCalledWith(
        mockTransactionInstance
      );
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });
});
