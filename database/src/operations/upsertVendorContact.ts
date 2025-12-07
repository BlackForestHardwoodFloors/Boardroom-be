import { AppDataSource } from "../data-source";
import { VendorContact } from "../entities/VendorContact";

export async function upsertVendorContact(vendorContact: VendorContact) {
    const vendorContactRepository = AppDataSource.getRepository(VendorContact);
    await vendorContactRepository.upsert(vendorContact, ['id']);
}