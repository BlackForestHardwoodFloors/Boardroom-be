import { Request, RequestHandler, Response } from 'express';
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { validateFields } from "../../utils/validateFields";
import { ContractorCompany } from "../../models/ContractorCompany";
import { sendResponse } from "../../utils/response";
import { Op } from 'sequelize';
import { paginate } from '../../utils/paginate';

interface ContractorCompanyRequestBody {
    id: string;
    companyName: string;
    email: string;
    phone: string;
}

export const createContractorCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { companyName, email, phone }: ContractorCompanyRequestBody = req.body;

        const requiredFields = ['companyName', 'phone'];
        if (!validateFields(requiredFields, req, res)) return;

        const existing = await ContractorCompany.findOne({ where: { email } });
        if (existing) {
            return sendResponse(res, 400, null, "A company with this email already exists");
        }

        const newCompany = await ContractorCompany.create({
            companyName,
            email,
            phone,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        return sendResponse(res, 201, newCompany, "Contractor company created successfully");
    } catch (error) {
        console.error("Error creating contractor company:", error);
        return sendResponse(res, 500, null, "An error occurred while creating the contractor company");
    }
};


export const getContractorCompanies: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search?.toString() || null;

        const whereCondition: any = {
            [Op.or]: [{ delete: { [Op.ne]: "Yes" } }, { delete: { [Op.is]: null } }]
        };

        if (search) {
            const searchableFields = ["companyName", "email", "phone", "createdBy", "modifiedBy"];
            whereCondition[Op.and] = [{
                [Op.or]: searchableFields.map(field => ({
                    [field]: { [Op.like]: `%${search}%` }
                }))
            }];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let companies, pagination;
        if (!page || !pageSize) {
            companies = await ContractorCompany.findAll(paginationOptions);
            pagination = null;
        } else {
            const result = await paginate(ContractorCompany, page, pageSize, paginationOptions);
            companies = result.data;
            pagination = result.pagination;
        }

        return sendResponse(res, 200, { companies, pagination }, "Contractor companies fetched successfully");
    } catch (error) {
        console.error("Error fetching contractor companies:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching contractor companies");
    }
};


export const updateContractorCompany: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const id = req.params.id;
        const { companyName, email, phone }: ContractorCompanyRequestBody = req.body;

        const requiredFields = ['companyName', 'phone'];
        if (!validateFields(requiredFields, req, res)) return;

        // Check if email already exists with a different company
        if (email) {
            const existingCompany = await ContractorCompany.findOne({
                where: {
                    email,
                    id: { [Op.ne]: id }, // Not the current company
                },
            });

            if (existingCompany) {
                return sendResponse(res, 400, null, 'Email is already in use by another company');
            }
        }

        const updated = await ContractorCompany.update(
            {
                companyName,
                email,
                phone,
                modifiedBy: req.user.firstName + ' ' + req.user.lastName,
                modifiedTime: new Date(),
            },
            { where: { id } }
        );

        return sendResponse(res, 201, updated, 'Contractor company updated successfully');
    } catch (error) {
        console.error('Error updating contractor company:', error);
        return sendResponse(
            res,
            500,
            null,
            'An error occurred while updating the contractor company'
        );
    }
};


export const deleteContractorCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await ContractorCompany.update({ delete: 'Yes' }, { where: { id } });
        return sendResponse(res, 201, null, "Contractor company deleted successfully");
    } catch (error) {
        console.error("Error deleting contractor company:", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the contractor company");
    }
};
