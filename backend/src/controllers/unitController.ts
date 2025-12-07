import { RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../middleware/authentication";
import { sendResponse } from "../utils/response";
import { validateFields } from "../utils/validateFields";
import { Units } from "../models/Units";

export const createUnit: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { unit } = req.body;

        const requiredFields = ['unit'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newRecord = await Units.create({
            unit,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        console.log("🚀 ~ created unit:", newRecord)

        return sendResponse(res, 201, newRecord, "unit created successfully");
    } catch (error) {
        console.log("Error while creating contact", error);
        return sendResponse(res, 500, null, "An error occurred while creating the unit");
    }
};
export const getUnit: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const unit = await Units.findAll({});

        return sendResponse(res, 200, unit, "unit found");
    } catch (error) {
        console.log("Error while creating contact", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the unit");
    }
};

export const updateUnit: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { unit } = req.body;
        const { id } = req.params;

        const requiredFields = ['unit'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updatedUnit = await Units.update(
            {
                unit,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            },
            {
                where: { id: id },
            }
        );
        console.log("🚀 ~ updated unit :", updatedUnit)

        return sendResponse(res, 201, updatedUnit, "Unit updated successfully");
    } catch (error) {
        console.log("Error while creating contact", error);
        return sendResponse(res, 500, null, "An error occurred while updating the unit");
    }
};

export const deleteUnit: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Units.destroy({
            where: { id: id },
        });
        return sendResponse(res, 201, null, "Unit deleted successfully");
    } catch (error) {
        console.log("Error while deleting unit", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the unit");
    }
}