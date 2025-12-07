import { Authentication } from "../entities/Authentication";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export async function getUser(
  userId: number
): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);

    const result = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :userId", { userId })
        .getOne();
    
    return result;
}
