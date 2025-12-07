import { AppDataSource } from "../../data-source";
import { Category } from "../../entities/Category";

export async function listCategory(): Promise<Category[]> {
    const categoryRepository = AppDataSource.getRepository(Category);

    const result = await categoryRepository
        .createQueryBuilder("Category")
        .leftJoinAndSelect("Category.createdByUser", "user")
        .select([
            "Category",
            "user.first_name",
            "user.last_name",
        ])
        .getMany();

    return result;
}
