import { UserRepository } from "./adapter-interfaces/UserRepository";
import { User } from "../entities/User";

export class GetUserUseCase {
  constructor(readonly userRepository: UserRepository) {}

  execute = async (id: string | null): Promise<User> => {
    if (!id) throw new Error("id is required");
    const user = await this.userRepository.getById(id);
    if (!user) throw new Error(`${id} is not found`);
    return user;
  };
}
