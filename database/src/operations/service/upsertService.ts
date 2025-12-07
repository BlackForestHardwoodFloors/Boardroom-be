import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/Service";

export async function upsertService(service: Service) {
    const serviceRepository = AppDataSource.getRepository(Service);
    await serviceRepository.upsert(service, {
        conflictPaths: ['id']
    });
}