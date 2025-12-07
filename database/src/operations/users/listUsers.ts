import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User";

export async function listUsers(): Promise<any[]> {
    const userRepository = AppDataSource.getRepository(User);

    const result = await userRepository
        .createQueryBuilder("user")
        .leftJoin("User", "creator", "user.created_by = creator.id")
        .leftJoin("RolePermission", "role", "user.role_and_permission_id = role.id")
        .leftJoin("Designation", "designation", "user.designation_id = designation.id")
        .select([
            "user.first_name AS firstName",
            "user.last_name AS lastName",
            "user.email AS email",
            "user.phone AS phone",
            "user.created_by AS createdBy",
            "user.created_time AS createdAt",
            "user.designation_id AS designationId",
            "user.role_and_permission_id AS roleId",
            "creator.first_name AS creator_first_name",
            "creator.last_name AS creator_last_name",
            "role.name AS role",
            "designation.name AS designation"
        ])
        .getRawMany();

    return result;
}
