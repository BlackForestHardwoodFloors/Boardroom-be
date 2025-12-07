/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { upsertUsers } from "../../../../database/src/operations/users/upsertUsers";
import { User } from "../../../../database/src/entities/User";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    designationId: z.string(),
    roleId: z.string(),
    modifiedBy: z.string(),
    modifiedTime: z.string().optional()
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
    const Users = new User();
    Users.id = parseInt(requestBody.id);
    Users.first_name = requestBody.firstName;
    Users.last_name = requestBody.lastName;
    Users.email = requestBody.email;
    Users.designationId = parseInt(requestBody.designationId);
    Users.phone = requestBody.phone?.toString() || "" ;
    Users.roleId = parseInt(requestBody.roleId);
    Users.modifiedBy = parseInt(requestBody.modifiedBy);
    await upsertUsers(Users);
    return {
      statusCode: 200,
      body: "User updated successfully",
    };
  } catch (error: any) {
    console.log("Error while updating User: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
