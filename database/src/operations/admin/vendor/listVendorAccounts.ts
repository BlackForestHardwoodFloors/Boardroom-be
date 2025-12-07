import { AppDataSource } from "../../../data-source";
import { VendorAccount } from "../../../entities/VendorAccount";

export async function listVendorAccounts(): Promise<VendorAccount[]> {
    const vendorAccountRepository = AppDataSource.getRepository(VendorAccount);

    const result = await vendorAccountRepository
        .createQueryBuilder("vendorAccount")
        .leftJoinAndSelect("vendorAccount.createdByUser", "user")
        .select([
            "vendorAccount",
            "user.first_name",
            "user.last_name",
        ])
        .getMany();

    return result;
}
