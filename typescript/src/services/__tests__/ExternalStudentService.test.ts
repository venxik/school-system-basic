jest.mock('axios');

import axios from 'axios';
import { ExternalStudentService } from '../ExternalStudentService';

const mockedAxios = axios as jest.MockedFunction<typeof axios> & {
  get: jest.MockedFunction<typeof axios.get>;
};

describe('ExternalStudentService', () => {
  let service: ExternalStudentService;

  beforeEach(() => {
    service = new ExternalStudentService();
    jest.clearAllMocks();
  });

  it('should fetch external students successfully', async () => {
    const mockResponse = {
      data: {
        count: 2,
        students: [
          { id: 1, name: 'External Student 1', email: 'external1@test.com' },
          { id: 2, name: 'External Student 2', email: 'external2@test.com' },
        ],
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await service.fetchStudents('P1-1', 0, 10);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/students'),
      {
        params: {
          class: 'P1-1',
          offset: 0,
          limit: 10,
        },
      }
    );
    expect(result.count).toBe(2);
    expect(result.students).toHaveLength(2);
    expect(result.students[0].email).toBe('external1@test.com');
  });

  it('should handle API errors', async () => {
    const mockError = new Error('Network error');
    mockedAxios.get.mockRejectedValue(mockError);

    await expect(service.fetchStudents('P1-1', 0, 10)).rejects.toThrow(
      'Network error'
    );

    expect(mockedAxios.get).toHaveBeenCalled();
  });
});
