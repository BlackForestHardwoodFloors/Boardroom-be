import { Request, RequestHandler, Response } from 'express';
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { validateFields } from "../../utils/validateFields";
import { Company } from "../../models/CompanyModel";
import { sendResponse } from "../../utils/response";
import { Op } from 'sequelize';
import { paginate } from '../../utils/paginate';

interface CompanyRequestBody {
    id: string;
    companyName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    addressType: string
}

export const createCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            companyName,
            street,
            city,
            state,
            country,
            zipcode,
            addressType
        } = req.body;

        const requiredFields = ['companyName'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newCompany = await Company.create({
            companyName,
            street: street || null,
            city: city || null,
            state: state || null,
            country: country || null,
            zipcode: zipcode || null,
            addressType: addressType || 'Billing Address', 
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newCompany, "Company created successfully");
    } catch (error) {
        console.log("Error while creating Company", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Company");
    }
}

export const getCompany: RequestHandler = async (req: Request, res: Response): Promise<any> => {
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
            const searchableFields = ["companyName", "createdBy", "modifiedBy"];
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

        let companies;
        let pagination;

        if (!page || !pageSize) {
            companies = await Company.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Company, page, pageSize, paginationOptions);
            companies = result.data;
            pagination = result.pagination;
        }
        companies = companies.filter((company: any) => company.delete === 'No');
        return sendResponse(res, 200, { companies, pagination }, "Company found");
    } catch (error) {
        console.log("Error while fetching Company", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Company");
    }
};

export const updateCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            companyName,
            street,
            city,
            state,
            country,
            zipcode,
            addressType
        }: CompanyRequestBody = req.body;

        const requiredFields = ['companyName'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateCompany = await Company.update({
            companyName,
            street: street || null,
            city: city || null,
            state: state || null,
            country: country || null,
            zipcode: zipcode || null,
            addressType: addressType || 'Billing Address', 
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateCompany, "Company updated successfully");
    } catch (error) {
        console.log("Error while updating Company", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Company");
    }
}

export const deleteCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Company.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Company deleted successfully");
    } catch (error) {
        console.log("Error while deleting Company", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Company");
    }
}