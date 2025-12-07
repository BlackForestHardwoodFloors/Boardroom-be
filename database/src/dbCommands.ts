import { EntityTarget, In, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource, initialize } from "./data-source";

export async function selectEntitiesById<EntityType extends ObjectLiteral>(
  entity: EntityTarget<EntityType>,
  ids: string[],
  selectFields: string[],
): Promise<EntityType[]> {
  await initialize();
  const repository: Repository<EntityType> =
    AppDataSource.getRepository(entity);
  return await repository
    .createQueryBuilder()
    .select(selectFields)
    .where({ id: In(ids) })
    .getRawMany();
}

export async function upsertEntities<EntityType extends ObjectLiteral>(
  entity: EntityTarget<EntityType>,
  entities: EntityType[],
): Promise<EntityType[]> {
  try {
    await initialize();
    const repository: Repository<EntityType> =
      AppDataSource.getRepository(entity);
    return await repository.save(entities);
  } catch (error) {
    console.log("Error upserting entities", error);
    return [];
  }
}
