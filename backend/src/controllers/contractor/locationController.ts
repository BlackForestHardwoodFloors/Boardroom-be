import { Request, RequestHandler, Response } from "express";
import { validateFields } from "../../utils/validateFields";
import { ContractorLocation } from "../../models/ContractorLocations";
import { ContractorContact } from "../../models/ContractorContact";
import { sendResponse } from "../../utils/response";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { paginate } from "../../utils/paginate";
import { Op } from "sequelize";

interface ContractorLocationRequestBody {
    id: string;
    contactId: string;
    contactName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    addressType: string;
}

export const createContractorLocation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            contactId,
            contactName,
            street,
            city,
            state,
            country,
            zipcode,
            addressType
        }: ContractorLocationRequestBody = req.body;
        console.log("Creating contractor location with data:", req.body);
        const contact = await ContractorContact.findByPk(contactId);
        if (!contact) {
            return sendResponse(res, 404, null, "Contractor contact not found");
        }

        const newLocation = await ContractorLocation.create({
            contactId,
            contactName,
            street,
            city,
            state,
            country,
            zipcode,
            addressType,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        return sendResponse(res, 201, newLocation, "Contractor location created successfully");
    } catch (error) {
        console.error("Error while creating contractor location", error);
        return sendResponse(res, 500, null, "An error occurred while creating the contractor location");
    }
};

export const updateContractorLocation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const {
            street,
            city,
            state,
            country,
            zipcode,
            contactName,
            addressType
        }: ContractorLocationRequestBody = req.body;

        const location = await ContractorLocation.findByPk(id);
        if (!location) {
            return sendResponse(res, 404, null, "Contractor location not found");
        }

        await ContractorLocation.update({
            street,
            city,
            state,
            country,
            zipcode,
            contactName,
            addressType,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        }, {
            where: { id }
        });

        return sendResponse(res, 200, null, "Contractor location updated successfully");
    } catch (error) {
        console.error("Error while updating contractor location", error);
        return sendResponse(res, 500, null, "An error occurred while updating the contractor location");
    }
};

export const getContractorLocations: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search?.toString() || null;

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["street", "city", "state", "country", "zipcode", "contactName", "addressType"];
            whereCondition[Op.and] = [{
                [Op.or]: searchableFields.map(field => ({
                    [field]: { [Op.like]: `%${search}%` }
                }))
            }];
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [["createdTime", "DESC"]]
        };

        let locations, pagination;

        if (!page || !pageSize) {
            locations = await ContractorLocation.findAll(paginationOptions);
            pagination = null;
        } else {
            const result = await paginate(ContractorLocation, page, pageSize, paginationOptions);
            locations = result.data;
            pagination = result.pagination;
        }

        return sendResponse(res, 200, { locations, pagination }, "Contractor locations fetched successfully");
    } catch (error) {
        console.error("Error while fetching contractor locations", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the contractor locations");
    }
};

export const deleteContractorLocation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await ContractorLocation.update({ delete: 'Yes' }, { where: { id } });
        return sendResponse(res, 200, null, "Contractor location deleted successfully");
    } catch (error) {
        console.error("Error while deleting contractor location", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the contractor location");
    }
};
