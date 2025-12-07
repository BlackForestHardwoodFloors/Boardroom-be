import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { WageRate } from '../../models/WageRate';
import { paginate } from '../../utils/paginate';
import { Employee } from '../../models/Employee';
import { Op } from 'sequelize';
import { getEmployeeMap } from '../../utils/helper';

interface WagerateRequestBody {
    id: string;
    employee: string;
    baseRatePerHour: string;
}

export const createOrUpdateWagerate: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            employee,
            baseRatePerHour,
        }: WagerateRequestBody = req.body;

        const requiredFields = ['employee', 'baseRatePerHour'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // If an ID is provided, perform the update
        if (id) {
            const updatedWagerate = await WageRate.update({
                employee,
                baseRatePerHour,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date()
            }, {
                where: { id: id }
            });

            if (updatedWagerate[0] === 0) {
                return sendResponse(res, 404, null, "Wagerate not found");
            }

            return sendResponse(res, 200, updatedWagerate, "Wagerate updated successfully");
        }

        // If no ID is provided, perform the create operation
        const newWagerate = await WageRate.create({
            employee,
            baseRatePerHour,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        return sendResponse(res, 201, newWagerate, "Wagerate created successfully");
    } catch (error) {
        console.log("Error while upserting Wagerate", error);
        return sendResponse(res, 500, null, "An error occurred while upserting the Wagerate");
    }
};

export const getWagerate: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const employeeId = req.query.employee;
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const [employeeMap, employeeIds] = search ? await getEmployeeMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ],
            ...(employeeId ? { employee: employeeId } : {}),
        };

        if (search) {
            const searchableFields = ["baseRatePerHour"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        ...(employeeIds.length > 0 ? [{ employee: { [Op.in]: employeeIds } }] : []) // Search by unit ID if unitName matches
                    ]
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let wagerates;
        let pagination;

        if (!page || !pageSize) {
            wagerates = await WageRate.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(WageRate, page, pageSize, paginationOptions);
            wagerates = result.data;
            pagination = result.pagination;
        }
        wagerates = wagerates.map(item => ({
            ...item.toJSON(),
            employeeName: employeeMap[item.employee] || null
        }));
        // const wagerates = await WageRate.findAll();
        return sendResponse(res, 200, { wagerates, pagination }, "Wagerates found");
    } catch (error) {
        console.log("Error while fetching Wagerates", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Wagerates");
    }
};

export const deleteWagerate: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await WageRate.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Wagerate deleted successfully");
    } catch (error) {
        console.log("Error while deleting Wagerate", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Wagerate");
    }
}