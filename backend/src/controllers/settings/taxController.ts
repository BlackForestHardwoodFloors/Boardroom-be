import { Request, RequestHandler, Response } from 'express';

import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { Taxes } from '../../models/Tax';
import { paginate } from '../../utils/paginate';
import { Op } from 'sequelize';


export const createTax: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            city,
            state,
            taxRate,
            taxCode,
        } = req.body;

        const requiredFields = ['city', 'state', 'taxRate', 'taxCode'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newTax = await Taxes.create({
            city,
            state,
            taxRate,
            taxCode,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newTax, "Taxes created successfully");
    } catch (error) {
        console.log("Error while creating Taxes", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Taxes");
    }
}

export const getTax: RequestHandler = async (req: Request, res: Response): Promise<any> => {
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
            const searchableFields = ["city", "state", "taxRate", "taxCode", "createdBy", "modifiedBy"];
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

        let Tax;
        let pagination;

        if (!page || !pageSize) {
            Tax = await Taxes.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Taxes, page, pageSize, paginationOptions);
            Tax = result.data;
            pagination = result.pagination;
        }

        // const Tax = await Taxes.findAll();
        return sendResponse(res, 200, { Tax, pagination }, "Taxes found");
    } catch (error) {
        console.log("Error while fetching Taxes", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Taxes");
    }
};

export const updateTax: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            city,
            state,
            taxRate,
            taxCode,
        } = req.body;

        const requiredFields = ['city', 'state', 'taxRate', 'taxCode'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateTax = await Taxes.update({
            city,
            state,
            taxRate,
            taxCode,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateTax, "Taxes updated successfully");
    } catch (error) {
        console.log("Error while updating Taxes", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Taxes");
    }
}

export const deleteTax: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Taxes.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Tax deleted successfully");
    } catch (error) {
        console.log("Error while deleting Tax", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Tax");
    }
}