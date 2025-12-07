import { SelectQueryBuilder } from "typeorm";
import { Authentication } from "../entities/Authentication";
import { AppDataSource } from "../data-source";

export async function authenticateUser(
  username: string,
  password: string
): Promise<{ userId: number; type: string }> {
    const authenticationRepository = AppDataSource.getRepository(Authentication);

    const result = await authenticationRepository
        .createQueryBuilder("authentication")
        .where("authentication.email = :username", { username })
        .andWhere("authentication.password = :password", { password })
        .getOne();
    
    return {
        userId: result?.user_id,
        type: result?.type
    };
}