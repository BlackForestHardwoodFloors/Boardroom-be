import { Authentication } from "../entities/Authentication";
import { AppDataSource } from "../data-source";
import { VendorContact } from "../entities/VendorContact";
import { User } from "../entities/User";
import { VendorAccount } from "../entities/VendorAccount";

export async function listVendorContacts(): Promise<VendorContact[]> {
    const vendorContactRepository = AppDataSource.getRepository(VendorContact);

    const result = await vendorContactRepository
        .createQueryBuilder("vendorContact")
        .leftJoinAndSelect("vendorContact.createdByUser", "user")
        .leftJoinAndSelect("vendorContact.vendorAccount", "account")
        .select([
            "vendorContact",
            "user.first_name",
            "user.last_name",
            "account.name" as "accountName",
        ])
        .getMany();

    return result;
}
