import { AppDataSource } from "../../data-source";
import { Site } from "../../entities/Site";
import { User } from "../../entities/User";
import { ClientAccount } from "../../entities/ClientAccount";
import { ClientContact } from "../../entities/ClientContact";

export async function listSite(): Promise<Site[]> {
    const siteRepository = AppDataSource.getRepository(Site);

    const result = await siteRepository
    .createQueryBuilder("Site")
    .leftJoinAndSelect("Site.createdByUser", "User")
    .leftJoinAndSelect("Site.contact", "clientContact")
    .leftJoinAndSelect("Site.account", "clientAccount")
    .select([
        "Site.id",
        "Site.siteNumber",
        "Site.locationName",
        "Site.street",
        "Site.city",
        "Site.state",
        "Site.country",
        "Site.zipCode",
        "Site.mapLink",
        "Site.portalAccess",
        "Site.contactId",
        "Site.accountId",
        "Site.operationalAssociateId",
        "Site.operationalManagerId",
        "Site.salesAssociateId",
        "Site.salesManagerId",
        "Site.createdBy",
        "Site.createdTime",
        "Site.modifiedBy",
        "Site.modifiedTime",
        "Site.status",
        "User.first_name",
        "User.last_name",
        "clientContact.firstName",
        "clientContact.lastName",
        "clientAccount.name"
    ])
    .getMany();

    return result;
}
