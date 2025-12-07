import { Request, RequestHandler, Response } from 'express';

import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { Department } from '../../models/Departments';
import { paginate } from '../../utils/paginate';
import { Op } from 'sequelize';


export const createDepartment: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            departmentName,
        } = req.body;

        const requiredFields = ['departmentName'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newDepartment = await Department.create({
            departmentName,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newDepartment, "Department created successfully");
    } catch (error) {
        console.log("Error while creating department", error);
        return sendResponse(res, 500, null, "An error occurred while creating the department");
    }
}
export const getDepartment: RequestHandler = async (req: Request, res: Response): Promise<any> => {
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
            const searchableFields = ["departmentName", "createdBy", "modifiedBy"];
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

        let department;
        let pagination;

        if (!page || !pageSize) {
            department = await Department.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Department, page, pageSize, paginationOptions);
            department = result.data;
            pagination = result.pagination;
        }
        department = department.filter((company: any) => company.delete === 'No');
        // const department = await Department.findAll();
        return sendResponse(res, 200, { department, pagination }, "department found");
    } catch (error) {
        console.log("Error while fetching department", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the department");
    }
};

export const updateDepartment: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            departmentName,
        } = req.body;

        const requiredFields = ['departmentName'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateDepartment = await Department.update({
            departmentName,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateDepartment, "Department updated successfully");
    } catch (error) {
        console.log("Error while updating department", error);
        return sendResponse(res, 500, null, "An error occurred while updating the department");
    }
}

export const deleteDepartment: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Department.update(
            { delete: "Yes" },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Department deleted successfully");
    } catch (error) {
        console.log("Error while deleting Department", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Department");
    }
}