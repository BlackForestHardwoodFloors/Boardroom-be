import { Request, RequestHandler, Response } from 'express';

import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { RolePermission } from '../../models/RolePermission';
import { paginate } from '../../utils/paginate';
import { Op } from 'sequelize';


export const createRolesPermission: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            role,
        } = req.body;

        const requiredFields = ['role'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newRolesPermission = await RolePermission.create({
            role,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newRolesPermission, "Roles and Permission created successfully");
    } catch (error) {
        console.log("Error while creating Roles and Permission", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Roles and Permission");
    }
}
export const getRolesPermission: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["role", "createdBy", "modifiedBy"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                    ]
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let roles;
        let pagination;

        if (!page || !pageSize) {
            roles = await RolePermission.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(RolePermission, page, pageSize, paginationOptions);
            roles = result.data;
            pagination = result.pagination;
        }
        roles = roles.filter((company: any) => company.delete === 'No');
        return sendResponse(res, 200, { roles, pagination }, "Roles and Permission found");
    } catch (error) {
        console.log("Error while fetching Roles and Permission", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Roles and Permission");
    }
};

export const updateRolesPermission: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            role,
        } = req.body;

        const requiredFields = ['role'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateRolesPermission = await RolePermission.update({
            role,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateRolesPermission, "Roles and Permission updated successfully");
    } catch (error) {
        console.log("Error while updating Roles and Permission", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Roles and Permission");
    }
}

export const deleteRolePrmission: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await RolePermission.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Role and Permission deleted successfully");
    } catch (error) {
        console.log("Error while deleting Role and Permission", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Role and Permission");
    }
}