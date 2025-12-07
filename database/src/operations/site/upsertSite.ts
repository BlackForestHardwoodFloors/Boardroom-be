import { AppDataSource } from "../../data-source";
import { Site } from "../../entities/Site";

export async function upsertSite(site: Site) {
    const siteRepository = AppDataSource.getRepository(Site);
    await siteRepository.upsert(site, {
        conflictPaths: ['id']
    });
}