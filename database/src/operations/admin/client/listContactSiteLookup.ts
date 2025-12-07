import { AppDataSource } from "../../../data-source";
import { ClientContact } from "../../../entities/ClientContact";

export async function listContactSiteLookup(): Promise<ClientContact[]> {
    const clientContactRepository = AppDataSource.getRepository(ClientContact);

    const result = await clientContactRepository
        .createQueryBuilder("clientContact")
        .leftJoin("clientContact.clientAccount", "account")
        .leftJoin("account.salesAssociate", "salesAssociate")
        .leftJoin("account.salesManager", "salesManager")
        .leftJoin("account.operationalAssociate", "operationalAssociate")
        .leftJoin("account.operationalManager", "operationalManager")
        .select([
            "clientContact.id",
            "clientContact.firstName",
            "clientContact.lastName",
            "account.id",
            "account.name",
            "account.salesAssociateId",
            "account.salesManagerId",
            "account.operationalAssociateId",
            "account.operationalManagerId",
            "salesAssociate.id",
            "salesAssociate.first_name",
            "salesAssociate.last_name",
            "salesManager.id",
            "salesManager.first_name",
            "salesManager.last_name",
            "operationalAssociate.id",
            "operationalAssociate.first_name",
            "operationalAssociate.last_name",
            "operationalManager.id",
            "operationalManager.first_name",
            "operationalManager.last_name"
        ])
        .getMany();

    return result;
    console.log("result", result);
}
