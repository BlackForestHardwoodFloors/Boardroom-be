import { Request, RequestHandler, Response } from "express";
import { ContractorContact } from "../../models/ContractorContact";
import { ContractorLocation } from "../../models/ContractorLocations";
import { sendResponse } from "../../utils/response";
import { validateFields } from "../../utils/validateFields";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { paginate } from "../../utils/paginate";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../config/database";

interface ContractorContactRequestBody {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phone: string;
    doNotSendEmail: boolean;
    message: string;
    operationsManager: string;
    additionalPhone: string;
}

export const createContractorContact: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const {
            firstName,
            lastName,
            companyName,
            email,
            phone,
            doNotSendEmail,
            message,
            operationsManager,
            additionalPhone,
        }: ContractorContactRequestBody = req.body;

        const requiredFields = [
            "firstName",
            "lastName",
            "phone",
            "operationsManager",
        ];
        if (!validateFields(requiredFields, req, res)) return;

        const existing = await ContractorContact.findOne({ where: { email } });
        if (existing) {
            return sendResponse(
                res,
                400,
                null,
                "A contractor contact with this email already exists"
            );
        }

        const newContact = await ContractorContact.create({
            firstName,
            lastName,
            companyName,
            email,
            phone,
            additionalPhone,
            doNotSendEmail,
            message,
            operationsManager,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date(),
        });

        return sendResponse(
            res,
            201,
            newContact,
            "Contractor contact created successfully"
        );
    } catch (error) {
        console.error("Error creating contractor contact", error);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while creating the contractor contact"
        );
    }
};

export const getContractorContacts: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize
            ? parseInt(req.query.pageSize as string)
            : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const whereCondition: any = {
            [Op.or]: [{ delete: { [Op.ne]: "Yes" } }, { delete: { [Op.is]: null } }],
        };

        if (search) {
            const fields = [
                "firstName",
                "lastName",
                "email",
                "phone",
                "createdBy",
                "modifiedBy",
            ];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...fields.map((field) => ({
                            [field]: { [Op.like]: `%${search}%` },
                        })),
                        {
                            [Op.and]: [
                                { firstName: { [Op.like]: `%${search.split(" ")[0]}%` } },
                                { lastName: { [Op.like]: `%${search.split(" ")[1] || ""}%` } },
                            ],
                        },
                        {
                            id: {
                                [Op.in]: Sequelize.literal(`(
                                      SELECT contactId FROM contractorLocations
                                      WHERE country LIKE '%${search}%' OR zipcode LIKE '%${search}%'
                                  )`),
                            },
                        },
                    ],
                },
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: ContractorLocation,
                    as: 'Locations',
                    required: false,
                },
            ],
            order: [["createdTime", "DESC"]],
        };

        let contacts;
        let pagination;

        if (page !== null && pageSize !== null) {
            const result = await paginate(
                ContractorContact,
                page,
                pageSize,
                paginationOptions
            );
            contacts = result.data;
            pagination = result.pagination;
        } else {
            contacts = await ContractorContact.findAll(paginationOptions);
            pagination = null;
        }

        return sendResponse(
            res,
            200,
            { contacts, pagination },
            "Contractor contacts found"
        );
    } catch (error) {
        console.error("Error fetching contractor contacts", error);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while fetching the contractor contacts"
        );
    }
};

export const updateContractorContact: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            firstName,
            lastName,
            companyName,
            email,
            phone,
            doNotSendEmail,
            message,
            operationsManager,
        }: ContractorContactRequestBody = req.body;
        console.log("Updating contractor contact with ID:", id);
        const requiredFields = [
            "firstName",
            "lastName",
            "phone",
            "operationsManager",
        ];
        if (!validateFields(requiredFields, req, res)) return;

        const updated = await ContractorContact.update(
            {
                firstName,
                lastName,
                companyName,
                email,
                phone,
                doNotSendEmail,
                message,
                operationsManager,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date(),
            },
            { where: { id } }
        );

        return sendResponse(
            res,
            201,
            updated,
            "Contractor contact updated successfully"
        );
    } catch (error) {
        console.error("Error updating contractor contact", error);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while updating the contractor contact"
        );
    }
};

export const deleteContractorContact: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params;
        const transaction = await sequelize.transaction();

        try {
            await ContractorContact.update(
                { delete: "Yes" },
                { where: { id }, transaction }
            );

            await ContractorLocation.update(
                { delete: "Yes" },
                { where: { contactId: id }, transaction }
            );

            await transaction.commit();
            return sendResponse(
                res,
                201,
                null,
                "Contractor contact and related locations deleted successfully"
            );
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error("Error deleting contractor contact", error);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while deleting the contractor contact"
        );
    }
};
