import { AppDataSource } from "../../data-source";
import { Service } from "../../entities/Service";
import { Category } from "../../entities/Category";

export async function listService(): Promise<Service[]> {
    const serviceRepository = AppDataSource.getRepository(Service);

    const result = await serviceRepository
        .createQueryBuilder("Service")
        .leftJoinAndSelect("Service.createdByUser", "User")
        .leftJoinAndSelect("Service.category", "Category")
        .select([
            "Service.id",
            "Service.name",
            "Service.createdTime",
            "Service.description",
            "Service.categoryId",
            "Service.status",
            "Category.name",
            "User.first_name",
            "User.last_name",

        ])
        .getMany();

    return result;
}
