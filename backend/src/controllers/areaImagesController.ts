
import { RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../middleware/authentication";
import { validateFields } from "../utils/validateFields";
import { AreaImages } from "../models/AreaImages";
import { sendResponse } from "../utils/response";
import dotenv from "dotenv";

dotenv.config();

export const uploadAreaImages: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { areaImagesData, quoteId, showToClient } = req.body;

        if (!areaImagesData || !Array.isArray(areaImagesData) || areaImagesData.length === 0) {
            return sendResponse(res, 400, null, "No areaImagesData provided");
        }

        const requiredFields = ['roomName', 'images'];

        for (let i = 0; i < areaImagesData.length; i++) {
            const areaImage = areaImagesData[i];

            // Validate the fields for the current areaImage
            const missingFields = requiredFields.filter(field => !areaImage.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const newAreaImages = await AreaImages.bulkCreate(
            areaImagesData.map((areaImage: any) => ({
                roomName: areaImage.roomName,
                images: areaImage.images,
                quoteId: quoteId,
                showToClient: showToClient
            }))
        );


        return sendResponse(res, 201, { areaImagesData: newAreaImages }, "newAreaImages created successfully");

    } catch (error) {

    }
}

export const updateAreaImages: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { areaImagesData, quoteId, showToClient } = req.body;
        console.log("🚀 ~ constupdateAreaImages:RequestHandler= ~ showToClient:", showToClient)

        if (!areaImagesData || !Array.isArray(areaImagesData) || areaImagesData.length === 0) {
            return sendResponse(res, 400, null, "No areaImagesData provided");
        }

        const requiredFields = ['roomName', 'images'];

        for (let i = 0; i < areaImagesData.length; i++) {
            const areaImage = areaImagesData[i];

            // Validate the fields for the current areaImage
            const missingFields = requiredFields.filter(field => !areaImage.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        // Get existing area images from the DB
        const existingAreaImages = await AreaImages.findAll({ where: { quoteId } }) as unknown as any;
        const receivedAreaImagesIds = new Set(areaImagesData.map(m => m.id).filter(Boolean));

        const updatedAreaImages: any[] = [];
        const newAreaImages: Partial<any>[] = [];

        for (const areaImage of areaImagesData) {
            if (areaImage.id) {
                const existingAreaImage = await AreaImages.findByPk(areaImage.id);
                if (existingAreaImage) {
                    await existingAreaImage.update({
                        roomName: areaImage.roomName,
                        images: areaImage.images,
                        showToClient: areaImage.showToClient,
                    });
                    updatedAreaImages.push(existingAreaImage);
                } else {
                    return sendResponse(res, 404, null, `areaImage with ID ${areaImage.id} not found`);
                }
            } else {
                newAreaImages.push({
                    roomName: areaImage.roomName,
                    images: areaImage.images,
                    quoteId: quoteId,
                    showToClient: showToClient
                });
            }
        }

        // Bulk create new area images if any
        if (newAreaImages.length > 0) {
            const createdAreaImages = await AreaImages.bulkCreate(newAreaImages);
            updatedAreaImages.push(...createdAreaImages);
        }

        // Delete area images that are not part of the received data
        const areaImagesToDelete = existingAreaImages.filter(m => !receivedAreaImagesIds.has(m.id));
        if (areaImagesToDelete.length > 0) {
            await AreaImages.destroy({ where: { id: areaImagesToDelete.map(m => m.id) } });
        }

        return sendResponse(res, 200, { areaImagesData: updatedAreaImages }, "Area Images updated successfully");
    } catch (error) {
        console.error("Error while updating area images:", error);
        return sendResponse(res, 500, null, "An error occurred while updating images");
    }
};