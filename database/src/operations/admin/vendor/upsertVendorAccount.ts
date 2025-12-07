import { AppDataSource } from "../../../data-source";
import { VendorAccount } from "../../../entities/VendorAccount";

export async function upsertVendorAccount(vendorAccount: VendorAccount) {
    const vendorAccountRepository = AppDataSource.getRepository(VendorAccount);
    await vendorAccountRepository.upsert(vendorAccount, {
        conflictPaths: ['id']
    });
}