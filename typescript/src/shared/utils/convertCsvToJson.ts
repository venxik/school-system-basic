import fs from 'fs';
import csv from 'csv-parser';
import { CsvItem } from '../types/CsvItem';
import { validateCsvHeaders } from './csvValidator';
import ErrorBase from '@shared/errors/ErrorBase';
import ErrorCodes from '@shared/constants/ErrorCodes';
import { StatusCodes } from 'http-status-codes';

export const convertCsvToJson = (filePath: string): Promise<CsvItem[]> => {
  const results: CsvItem[] = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  return new Promise((resolve, reject) => {
    stream.on('headers', (headers: string[]) => {
      const headerError = validateCsvHeaders(headers);
      if (headerError) {
        reject(
          new ErrorBase(
            `Invalid CSV headers: ${headerError}`,
            ErrorCodes.CSV_PARSE_ERROR_CODE,
            StatusCodes.BAD_REQUEST
          )
        );
        stream.destroy();
        return;
      }
    });

    stream.on('data', (data: CsvItem) => results.push(data));
    stream.on('end', () => resolve(results));
    stream.on('error', (err) => reject(err));
  });
};
