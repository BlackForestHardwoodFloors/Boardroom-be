import { AppDataSource } from "../../../data-source";
import { ClientAccount } from "../../../entities/ClientAccount";

export async function upsertClientAccount(clientAccount: ClientAccount) {
    const clientAccountRepository = AppDataSource.getRepository(ClientAccount);
    await clientAccountRepository.upsert(clientAccount, {
        conflictPaths: ['id']
    });
}