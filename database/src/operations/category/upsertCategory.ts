import { AppDataSource } from "../../data-source";
import { Category } from "../../entities/Category";

export async function upsertCategory(category: Category) {
    const categoryRepository = AppDataSource.getRepository(Category);
    await categoryRepository.upsert(category, {
        conflictPaths: ['id']
    });
}