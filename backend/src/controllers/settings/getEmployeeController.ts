import { Request, RequestHandler, Response } from "express";
import { Employee } from "../../models/Employee";
import { Department } from "../../models/Departments";
import { RolePermission } from "../../models/RolePermission";
import { sendResponse } from "../../utils/response";
import { paginate } from "../../utils/paginate";
import { Op } from "sequelize";
import { getDepartmentMap, getRoleMap } from "../../utils/helper";

export const getEmployee: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const [departmentMap, departmentIds] = search ? await getDepartmentMap(search) : [{}, []];
        const [roleMap, roleIds] = search ? await getRoleMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["firstName", "lastName", "email", "phone", "portalStatus", "modifiedBy", "createdBy"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        {
                            [Op.and]: [
                                { firstName: { [Op.like]: `%${search.split(" ")[0]}%` } },
                                { lastName: { [Op.like]: `%${search.split(" ")[1] || ""}%` } }
                            ]
                        },
                        ...(departmentIds.length > 0 ? [{ department: { [Op.in]: departmentIds } }] : []),
                        ...(roleIds.length > 0 ? [{ rolesPermissions: { [Op.in]: roleIds } }] : [])
                    ]
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: [
                { model: Department },
                { model: RolePermission }
            ],
            order: [['createdTime', 'DESC']],
        };

        let employee;
        let pagination;

        if (!page || !pageSize) {
            employee = await Employee.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Employee, page, pageSize, paginationOptions);
            employee = result.data;
            pagination = result.pagination;
        }

        employee = employee.map(item => ({
            ...item.toJSON(),
            departmentName: departmentMap[item.department] || null,
            roleName: roleMap[item.rolesPermissions] || null
        }));

        console.log("employee:", employee?.length)
        return sendResponse(res, 200, { employee, pagination }, "employee found");
    } catch (error) {
        console.log("Error while fetching employee", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the employee");
    }
};