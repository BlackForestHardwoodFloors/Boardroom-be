import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { GeneralTasks } from '../../models/GeneralTask';
import { paginate } from '../../utils/paginate';
import { Op } from 'sequelize';

interface GeneralTaskRequestBody {
    id: string;
    taskName: string;
    description: string;
}

export const createOrUpdateGeneralTask: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            taskName,
            description,
        }: GeneralTaskRequestBody = req.body;

        const requiredFields = ['taskName'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // If an ID is provided, perform the update
        if (id) {
            const updatedGeneralTask = await GeneralTasks.update({
                taskName,
                description,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date()
            }, {
                where: { id: id }
            });

            if (updatedGeneralTask[0] === 0) {
                return sendResponse(res, 404, null, "GeneralTask not found");
            }

            return sendResponse(res, 200, updatedGeneralTask, "GeneralTask updated successfully");
        }

        // If no ID is provided, perform the create operation
        const newGeneralTask = await GeneralTasks.create({
            taskName,
            description,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        return sendResponse(res, 201, newGeneralTask, "GeneralTask created successfully");
    } catch (error) {
        console.log("Error while upserting GeneralTask", error);
        return sendResponse(res, 500, null, "An error occurred while upserting the GeneralTask");
    }
};

export const getGeneralTask: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || null;
        const pageSize = parseInt(req.query.pageSize as string) || null;
        const fetchAll = req.query.fetchAll === 'true';
        const search = req.query.search ? req.query.search.toString() : null;

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["taskName", "description", "modifiedBy", "createdBy"];
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

        let generalTasks;
        let pagination;
        if (fetchAll) {
            // Fetch all data without pagination
            generalTasks = await GeneralTasks.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(GeneralTasks, page, pageSize, paginationOptions);
            generalTasks = result.data;
            pagination = result.pagination;
        }

        generalTasks = generalTasks.filter((task: any) => task.delete === 'No');
        return sendResponse(res, 200, { generalTasks, pagination }, "GeneralTasks found");
    } catch (error) {
        console.log("Error while fetching GeneralTasks", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the GeneralTasks");
    }
};

export const deleteGeneralTask: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await GeneralTasks.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "GeneralTask deleted successfully");
    } catch (error) {
        console.log("Error while deleting GeneralTask", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the GeneralTask");
    }
}