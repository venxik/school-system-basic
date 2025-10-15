jest.mock('@repositories');

import { ClassService } from '../ClassService';
import { classRepository } from '@repositories';

describe('ClassService', () => {
  let service: ClassService;

  beforeEach(() => {
    service = new ClassService();
    jest.clearAllMocks();
  });

  it('should update class name successfully', async () => {
    const mockUpdateNameByCode =
      classRepository.updateNameByCode as jest.MockedFunction<
        typeof classRepository.updateNameByCode
      >;
    mockUpdateNameByCode.mockResolvedValue(undefined);

    await service.updateClassName('P1-1', 'Primary 1 Class A');

    expect(mockUpdateNameByCode).toHaveBeenCalledWith(
      'P1-1',
      'Primary 1 Class A'
    );
    expect(mockUpdateNameByCode).toHaveBeenCalledTimes(1);
  });

  it('should throw error when class not found', async () => {
    const mockUpdateNameByCode =
      classRepository.updateNameByCode as jest.MockedFunction<
        typeof classRepository.updateNameByCode
      >;
    mockUpdateNameByCode.mockRejectedValue(
      new Error('Class NONEXISTENT not found')
    );

    await expect(
      service.updateClassName('NONEXISTENT', 'New Name')
    ).rejects.toThrow('Class NONEXISTENT not found');

    expect(mockUpdateNameByCode).toHaveBeenCalledWith(
      'NONEXISTENT',
      'New Name'
    );
  });
});
