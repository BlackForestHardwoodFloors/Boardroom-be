import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { VendorCompany } from '../../models/VendorCompany';
import { Op } from 'sequelize';
import { paginate } from '../../utils/paginate';

interface VendorCompanyRequestBody {
    id: string;
    companyName: string,
    email: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    country: string,
    zipcode: string,
}

export const createVendorCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            companyName,
            email,
            phone,
            street,
            city,
            state,
            country,
            zipcode
        }: VendorCompanyRequestBody = req.body;

        const requiredFields = ['companyName', 'email', 'phone'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const existingCompany = await VendorCompany.findOne({
            where: {
                [Op.or]: [{ email }, { companyName }]
            }
        });

        if (existingCompany) {
            return sendResponse(res, 400, null, "A company with this email or name already exists");
        }


        const newVendorCompany = await VendorCompany.create({
            companyName,
            email,
            phone,
            street,
            city,
            state,
            country,
            zipcode,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });
        return sendResponse(res, 201, newVendorCompany, "VendorCompany created successfully");
    } catch (error) {
        console.log("Error while creating VendorCompany", error);
        return sendResponse(res, 500, null, "An error occurred while creating the VendorCompany");
    }
}

export const getVendorCompany: RequestHandler = async (req: Request, res: Response): Promise<any> => {
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
            const searchableFields = ["companyName", "email", "street", "city", "state", "country", "zipcode"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        (() => {
                            const searchParts = search.split(",").map(part => part.trim());
                            return {
                                [Op.and]: [
                                    { street: { [Op.like]: `%${searchParts[0] || ""}%` } },
                                    { city: { [Op.like]: `%${searchParts[1] || ""}%` } },
                                    { state: { [Op.like]: `%${searchParts[2] || ""}%` } },
                                    { country: { [Op.like]: `%${searchParts[3] || ""}%` } },
                                    { zipcode: { [Op.like]: `%${searchParts[4] || ""}%` } },
                                ]
                            };
                        })()
                    ]
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let vendorCompanies;
        let pagination;

        if (!page || !pageSize) {
            vendorCompanies = await VendorCompany.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(VendorCompany, page, pageSize, paginationOptions);
            vendorCompanies = result.data;
            pagination = result.pagination;
        }
        vendorCompanies = vendorCompanies.filter((company: any) => company.delete === 'No');
        return sendResponse(res, 200, { vendorCompanies, pagination }, "VendorCompanies found");
    } catch (error) {
        console.log("Error while fetching VendorCompanies", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the VendorCompanies");
    }
};

export const updateVendorCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            companyName,
            email,
            phone,
            street,
            city,
            state,
            country,
            zipcode,
        }: VendorCompanyRequestBody = req.body;

        const requiredFields = ['companyName', 'email', 'phone'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateVendorCompany = await VendorCompany.update({
            companyName,
            email,
            phone,
            street,
            city,
            state,
            country,
            zipcode,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateVendorCompany, "VendorCompany updated successfully");
    } catch (error) {
        console.log("Error while updating VendorCompany", error);
        return sendResponse(res, 500, null, "An error occurred while updating the VendorCompany");
    }
}

export const deleteVendorCompany: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await VendorCompany.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "VendorCompany deleted successfully");
    } catch (error) {
        console.log("Error while deleting VendorCompany", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the VendorCompany");
    }
}