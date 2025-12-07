import { RequestHandler, Response } from "express";
import { ContractorEmployee } from "../../models/ContractorEmployee";
import { Company } from "../../models/CompanyModel";
import { sendResponse } from "../../utils/response";
import { validateFields } from "../../utils/validateFields";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { paginate } from "../../utils/paginate";
import { Op } from "sequelize";

interface ContractorEmployeeRequestBody {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    additionalPhone: string;
    companyId: number;
}

export const createContractorEmployee: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            additionalPhone,
            companyId,
        }: ContractorEmployeeRequestBody = req.body;

        const requiredFields = ["firstName", "lastName", "phone", "companyId"];
        if (!validateFields(requiredFields, req, res)) return;

        if (email) {
            const existing = await ContractorEmployee.findOne({ where: { email } });
            if (existing) {
                return sendResponse(
                    res,
                    400,
                    null,
                    "A contractor employee with this email already exists"
                );
            }
        }

        const employee = await ContractorEmployee.create({
            firstName,
            lastName,
            email,
            phone,
            additionalPhone,
            companyId,
            createdBy: `${req.user.firstName} ${req.user.lastName}`,
            createdTime: new Date(),
            modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
            modifiedTime: new Date(),
        });

        return sendResponse(res, 201, employee, "Contractor employee created successfully");
    } catch (err) {
        console.error("Error creating contractor employee", err);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while creating the contractor employee"
        );
    }
};

export const getContractorEmployees: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize
            ? parseInt(req.query.pageSize as string)
            : null;
        const search = req.query.search?.toString();
        const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : null;

        const whereCondition: any = { delete: { [Op.ne]: "Yes" }, ...(companyId && { companyId }) };
        console.log(search)
        if (search) {
            whereCondition[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        const options: any = {
            where: whereCondition,
            include: [{ model: Company, as: "company" }],
            order: [["createdTime", "DESC"]],
        };

        let employees;
        let pagination;
        if (page && pageSize) {
            const result = await paginate(ContractorEmployee, page, pageSize, options);
            employees = result.data;
            pagination = result.pagination;
        } else {
            employees = await ContractorEmployee.findAll(options);
            pagination = null;
        }

        return sendResponse(res, 200, { employees, pagination }, "Contractor employees fetched");
    } catch (err) {
        console.error("Error fetching contractor employees", err);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while fetching contractor employees"
        );
    }
};

export const updateContractorEmployee: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            firstName,
            lastName,
            email,
            phone,
            additionalPhone,
            companyId,
        }: ContractorEmployeeRequestBody = req.body;

        const requiredFields = ["firstName", "lastName", "phone", "companyId"];
        if (!validateFields(requiredFields, req, res)) return;

        await ContractorEmployee.update(
            {
                firstName,
                lastName,
                email,
                phone,
                additionalPhone,
                companyId,
                modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                modifiedTime: new Date(),
            },
            { where: { id } }
        );

        return sendResponse(res, 200, null, "Contractor employee updated successfully");
    } catch (err) {
        console.error("Error updating contractor employee", err);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while updating contractor employee"
        );
    }
};

export const deleteContractorEmployee: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const { id } = req.params;
        await ContractorEmployee.update({ delete: "Yes" }, { where: { id } });
        return sendResponse(
            res,
            200,
            null,
            "Contractor employee deleted successfully"
        );
    } catch (err) {
        console.error("Error deleting contractor employee", err);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while deleting contractor employee"
        );
    }
};
