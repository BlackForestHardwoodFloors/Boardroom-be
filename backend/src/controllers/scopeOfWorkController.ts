import { RequestHandler, Response } from "express";
import { ScopeOfWork } from "../models/ScopeofWork";
import { IGetUserAuthInfoRequest } from "../middleware/authentication";
import { sendResponse } from "../utils/response";
import { validateFields } from "../utils/validateFields";

export const createScopeOfWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { productImage, type, serviceItemName, rate, description, status, isAddon, unit } = req.body;

        const requiredFields = ['type', 'serviceItemName', 'unit'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newRecord = await ScopeOfWork.create({
            productImage,
            type,
            serviceItemName,
            rate,
            description,
            status,
            isAddon,
            unit,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        console.log("🚀 ~ created scope:", newRecord)

        return sendResponse(res, 201, newRecord, "Scope of work created successfully");
    } catch (error) {
        console.log("Error while creating contact", error);
        return sendResponse(res, 500, null, "An error occurred while creating the scope of work");
    }
};

export const updateScopeOfWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { productImage, type, serviceItemName, rate, description, status, isAddon, unit } = req.body;
        const { id } = req.params;

        const requiredFields = ['type', 'serviceItemName', 'unit'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updatedScope = await ScopeOfWork.update(
            {
                productImage,
                type,
                serviceItemName,
                rate,
                description,
                status,
                isAddon,
                unit,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            },
            {
                where: { id: id },
            }
        );
        console.log("🚀 ~ updated scope :", updatedScope)

        return sendResponse(res, 201, updatedScope, "Scope of work updated successfully");
    } catch (error) {
        console.log("Error while creating contact", error);
        return sendResponse(res, 500, null, "An error occurred while updating the scope of work");
    }
};

export const deleteScopeOfWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await ScopeOfWork.update(
            { delete: 'Yes' },
            { where: { id: id } },
        );
        return sendResponse(res, 201, null, "Scope of work deleted successfully");
    } catch (error) {
        console.log("Error while deleting scope of work", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the scope of work");
    }
}