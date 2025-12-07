/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { upsertService } from "../../../../database/src/operations/service/upsertService";
import { Service, ServiceStatus } from "../../../../database/src/entities/Service";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    categoryId: z.number(),
    status: z.string(),
    modifiedBy: z.string(),
    modifiedTime: z.string(),
});

export const handler = requestHandler(async (event) => {
    await initialize();
    const validateRequestBody = BODY_SCHEMA.safeParse(
        JSON.parse(event.body as string),
    );
    if (!validateRequestBody.success) {
        return {
            statusCode: 400,
            body: { error: validateRequestBody.error },
        };
    }
    const requestBody = validateRequestBody.data;
    try {
        const service = new Service();
        service.id = parseInt(requestBody.id);
        service.name = requestBody.name;
        service.description = JSON.parse(requestBody.description);
        service.categoryId = requestBody.categoryId;
        service.status = requestBody.status as ServiceStatus;
        service.modifiedBy = parseInt(requestBody.modifiedBy);
        service.modifiedTime = new Date(requestBody.modifiedTime);
        await upsertService(service);
        return {
            statusCode: 200,
            body: "Service Updated successfully",
        };
    } catch (error: any) {
        console.log("Error while updating Service: ", error);
        return {
            statusCode: 404,
            body: error.message,
        };
    }
});

