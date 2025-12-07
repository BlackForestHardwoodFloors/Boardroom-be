import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { VendorContact } from '../../models/VendorContact';
import { paginate } from '../../utils/paginate';
import { VendorCompany } from '../../models/VendorCompany';
import { Op } from 'sequelize';
import { getVendorCompanyMap } from '../../utils/helper';

interface VendorContactRequestBody {
    id: string;
    firstName: string;
    lastName: string;
    designation: string;
    vendorCompany: string;
    phone: string;
}

export const createVendorContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            firstName,
            lastName,
            vendorCompany,
            designation,
            phone
        }: VendorContactRequestBody = req.body;

        const requiredFields = ['firstName', 'lastName', 'vendorCompany'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newVendorContact = await VendorContact.create({
            firstName,
            lastName,
            vendorCompany,
            designation,
            phone,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });
        return sendResponse(res, 201, newVendorContact, "VendorContact created successfully");
    } catch (error) {
        console.log("Error while creating VendorContact", error);
        return sendResponse(res, 500, null, "An error occurred while creating the VendorContact");
    }
}

export const getVendorContact: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const [companyMap, companyIds] = search ? await getVendorCompanyMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["firstName", "lastName", "phone"];
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
                        ...(companyIds.length > 0 ? [{ vendorCompany: { [Op.in]: companyIds } }] : [])
                    ],
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']]
        };

        let vendorContacts;
        let pagination;

        if (!page || !pageSize) {
            vendorContacts = await VendorContact.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(VendorContact, page, pageSize, paginationOptions);
            vendorContacts = result.data;
            pagination = result.pagination;
        }

        vendorContacts = vendorContacts.map(item => ({
            ...item.toJSON(),
            companyName: companyMap[item.vendorCompany] || null
        }));

        // const vendorContacts = await VendorContact.findAll();
        return sendResponse(res, 200, { vendorContacts, pagination }, "VendorContacts found");
    } catch (error) {
        console.log("Error while fetching VendorContacts", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the VendorContacts");
    }
};

export const updateVendorContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            firstName,
            lastName,
            vendorCompany,
            designation,
            phone
        }: VendorContactRequestBody = req.body;

        const requiredFields = ['firstName', 'lastName', 'vendorCompany'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateVendorContact = await VendorContact.update({
            firstName,
            lastName,
            vendorCompany,
            designation,
            phone,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        },
            {
                where: { id: id }
            }
        );
        return sendResponse(res, 201, updateVendorContact, "VendorContact updated successfully");
    } catch (error) {
        console.log("Error while updating VendorContact", error);
        return sendResponse(res, 500, null, "An error occurred while updating the VendorContact");
    }
}

export const deleteVendorContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await VendorContact.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "VendorContact deleted successfully");
    } catch (error) {
        console.log("Error while deleting VendorContact", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the VendorContact");
    }
}
