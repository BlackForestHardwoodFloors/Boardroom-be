import { Authentication } from "../entities/Authentication";
import { AppDataSource } from "../data-source";
import { ClientContact } from "../entities/ClientContact";
import { User } from "../entities/User";
import { ClientAccount } from "../entities/ClientAccount";

export async function listClientContacts(): Promise<ClientContact[]> {
    const clientContactRepository = AppDataSource.getRepository(ClientContact);

    const result = await clientContactRepository
        .createQueryBuilder("clientContact")
        .leftJoinAndSelect("clientContact.createdByUser", "user")
        .leftJoinAndSelect("clientContact.clientAccount", "account")
        .select([
            "clientContact",
            "user.first_name",
            "user.last_name",
            "account.name" as "accountName",
        ])
        .getMany();

    return result;
}
