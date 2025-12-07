/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { authenticateUser } from "../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../utils/helper.utils";
import { getUser } from "../../../../database/src/operations/getUser";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  username: z.string(),
  password: z.string(),
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
    const { userId, type } = await authenticateUser(requestBody.username, requestBody.password);
    if (userId)
    {
        const user = await getUser(userId)
        return { statusCode: 200, body: { ...user, type } };
    }
    else {
        return { statusCode: 401, body: "Invalid credentials" };
    }
  } catch (error: any) {
    console.log("Error while login: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
