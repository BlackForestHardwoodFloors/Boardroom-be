import { RequestHandler, Response } from "express";
import { sendResponse } from "../../utils/response";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { AdditionalWork } from "../../models/AdditionalWork";

export const createAdditionalWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { additionalWork, quoteId } = req.body;

        if (!Array.isArray(additionalWork)) {
            return sendResponse(res, 400, null, "Invalid additional work data");
        }

        if (additionalWork.length === 0) {
            await AdditionalWork.destroy({ where: { quoteId } });

            return sendResponse(res, 201, { additionalWork: [] }, "All additional work removed successfully");
        }

        const requiredFields = ['service', 'sqFeets', 'rate', 'amount'];

        for (let i = 0; i < additionalWork.length; i++) {
            const additional = additionalWork[i];

            const missingFields = requiredFields.filter(field => !additional.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const newAdditionalWork = await AdditionalWork.bulkCreate(
            additionalWork.map((additional: any) => ({
                service: additional.service,
                sqFeets: Number(additional.sqFeets),
                rate: additional.rate,
                amount: additional.amount,
                checked: additional.checked,
                quoteId: quoteId
            }))
        );

        return sendResponse(res, 201, { additionalWork: newAdditionalWork }, "Additional Work created successfully");

    } catch (error) {
        console.log("Error while creating AdditionalWork", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Additional Work");
    }
};

export const updateAdditionalWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { additionalWork, quoteId } = req.body;

        if (!Array.isArray(additionalWork)) {
            return sendResponse(res, 400, null, "Invalid additional work data");
        }

        if (additionalWork.length === 0) {
            await AdditionalWork.destroy({ where: { quoteId } });

            return sendResponse(res, 201, { additionalWork: [] }, "All additional work removed successfully");
        }

        const requiredFields = ['service', 'sqFeets', 'rate', 'amount'];

        for (const additional of additionalWork) {
            const missingFields = requiredFields.filter(field => !(field in additional));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const existingAdditionalWork = await AdditionalWork.findAll({ where: { quoteId } }) as unknown as any;

        const updateAdditionalWork: any = [];
        const newAdditionalWork: any = [];
        const receivednewAdditionalWorkIds = new Set(additionalWork.map(m => m.id).filter(Boolean)); // IDs of received additionalWork

        for (const additional of additionalWork) {
            if (additional.id) {
                const existingAdditional: any = await AdditionalWork.findByPk(additional.id) as unknown as any;
                if (existingAdditional) {
                    await existingAdditional.update({
                        ...additional
                    });
                    updateAdditionalWork.push(existingAdditional);
                } else {
                    return sendResponse(res, 404, null, `Additional with ID ${additional.id} not found`);
                }
            } else {
                newAdditionalWork.push({
                    ...additional,
                    quoteId
                });
            }
        }

        if (newAdditionalWork.length > 0) {
            const createdAdditionalWork: any = await AdditionalWork.bulkCreate(newAdditionalWork);
            updateAdditionalWork.push(...createdAdditionalWork);
        }

        const additionalWorkToDelete = existingAdditionalWork.filter(m => !receivednewAdditionalWorkIds.has(m.id));
        if (additionalWorkToDelete.length > 0) {
            await AdditionalWork.destroy({
                where: { id: additionalWorkToDelete.map(m => m.id) },
            });
        }

        return sendResponse(res, 201, { additionalWork: updateAdditionalWork }, "AdditionalWork updated successfully");

    } catch (error) {
        console.error("Error while updating additionalWork", error);
        return sendResponse(res, 500, null, "An error occurred while updating the additionalWork");
    }
};