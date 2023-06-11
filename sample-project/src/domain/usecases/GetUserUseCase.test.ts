import { User } from '../entities/User';
import { UserRepository } from './adapter-interfaces/UserRepository';
import { GetUserUseCase } from './GetUserUseCase';

const mockUser: Partial<User> = {
  email: 'test@email.com',
  id: '123',
  name: 'Test User',
};

const mockUserRepository: UserRepository = {
  create: jest.fn(),
  getById: jest.fn() as jest.Mock,
};

describe('GetUserUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws an error when user is not found', async () => {
    (mockUserRepository.getById as jest.Mock).mockResolvedValueOnce(null);
    const getUserUseCase = new GetUserUseCase(mockUserRepository);

    await expect(getUserUseCase.execute('some-id')).rejects.toThrow(
      'some-id is not found',
    );
  });

  test('returns a user when user is found', async () => {
    (mockUserRepository.getById as jest.Mock).mockResolvedValueOnce(mockUser);
    const getUserUseCase = new GetUserUseCase(mockUserRepository);

    const user = await getUserUseCase.execute('some-id');
    expect(user).toEqual(mockUser);
  });
});
