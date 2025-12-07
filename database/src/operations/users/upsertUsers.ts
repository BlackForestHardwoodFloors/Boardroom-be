import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User"

export async function upsertUsers(users: User) {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.upsert(users, ['id']);
}