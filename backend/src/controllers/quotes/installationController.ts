import { RequestHandler, Response } from "express";
import { sendResponse } from "../../utils/response";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { Installations } from "../../models/Installations";

export const createInstallations: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { installations, quoteId } = req.body;

        if (!Array.isArray(installations)) {
            return sendResponse(res, 400, null, "Invalid installations data");
        }

        if (installations.length === 0) {
            await Installations.destroy({ where: { quoteId } });

            return sendResponse(res, 201, { installations: [] }, "All installations removed successfully");
        }

        const requiredFields = ['phase', 'squareFeet', 'pricePerSqft'];

        for (let i = 0; i < installations.length; i++) {
            const installation = installations[i];

            const missingFields = requiredFields.filter(field => !installation.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const newInstallations = await Installations.bulkCreate(
            installations.map((install: any) => ({
                squareFeet: Number(install.squareFeet),
                pricePerSqft: install.pricePerSqft,
                materialPricePerSqft: install.materialPricePerSqft,
                phase: install.phase,
                amount: install.amount,
                quoteId: quoteId
            }))
        );

        return sendResponse(res, 201, { installations: newInstallations }, "installations created successfully");

    } catch (error) {
        console.log("Error while creating Installations", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Installations");
    }
};

export const updateInstallation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { installations, quoteId } = req.body;

        if (!Array.isArray(installations)) {
            return sendResponse(res, 400, null, "Invalid installations data");
        }

        if (installations.length === 0) {
            await Installations.destroy({ where: { quoteId } });

            return sendResponse(res, 201, { installations: [] }, "All installations removed successfully");
        }

        const requiredFields = ['phase', 'squareFeet', 'pricePerSqft'];

        for (const measurement of installations) {
            const missingFields = requiredFields.filter(field => !(field in measurement));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const existingInstallations = await Installations.findAll({ where: { quoteId } }) as unknown as any;

        const updateInstallations: any = [];
        const newInstallations: any = [];
        const receivednewInstallationIds = new Set(installations.map(m => m.id).filter(Boolean)); // IDs of received installations

        for (const installation of installations) {
            if (installation.id) {
                const existingInstallation: any = await Installations.findByPk(installation.id) as unknown as any;
                if (existingInstallation) {
                    await existingInstallation.update({
                        ...installation,
                    });
                    updateInstallations.push(existingInstallation);
                } else {
                    return sendResponse(res, 404, null, `Installation with ID ${installation.id} not found`);
                }
            } else {
                newInstallations.push({
                    squareFeet: Number(installation.squareFeet),
                    ...installation,
                    quoteId
                });
            }
        }

        if (newInstallations.length > 0) {
            const createdMeasurements: any = await Installations.bulkCreate(newInstallations);
            updateInstallations.push(...createdMeasurements);
        }

        const installationsToDelete = existingInstallations.filter(m => !receivednewInstallationIds.has(m.id));
        if (installationsToDelete.length > 0) {
            await Installations.destroy({
                where: { id: installationsToDelete.map(m => m.id) },
            });
        }

        return sendResponse(res, 201, { installations: updateInstallations }, "Installations updated successfully");

    } catch (error) {
        console.error("Error while updating installations", error);
        return sendResponse(res, 500, null, "An error occurred while updating the installations");
    }
};