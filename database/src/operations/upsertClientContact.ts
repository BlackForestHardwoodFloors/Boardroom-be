import { AppDataSource } from "../data-source";
import { ClientContact } from "../entities/ClientContact";

export async function upsertClientContact(clientContact: ClientContact) {
    const clientContactRepository = AppDataSource.getRepository(ClientContact);
    await clientContactRepository.upsert(clientContact, ['id']);
}