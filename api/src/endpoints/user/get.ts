/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
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
    return { statusCode: 200, body: {} };
  } catch (error: any) {
    console.log("Error while calculating the market rent values: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
