// ./src/domain/usecases/adapter-interfaces/UserRepository.ts
import { User } from "../../entities/User";

export interface UserRepository {
  create(user: User): Promise<void>;
  getById(id: string): Promise<User>;
}
