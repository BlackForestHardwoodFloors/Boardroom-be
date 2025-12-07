import { AppDataSource } from "../../../data-source";
import { ClientAccount } from "../../../entities/ClientAccount";

export async function listClientAccounts(): Promise<ClientAccount[]> {
    const clientAccountRepository = AppDataSource.getRepository(ClientAccount);

    const result = await clientAccountRepository
        .createQueryBuilder("clientAccount")
        .leftJoinAndSelect("clientAccount.createdByUser", "user")
        .select([
            "clientAccount",
            "user.first_name",
            "user.last_name",
        ])
        .getMany();

    return result;
}
