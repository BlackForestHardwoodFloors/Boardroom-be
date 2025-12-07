/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { upsertCategory } from "../../../../database/src/operations/category/upsertCategory";
import { Category } from "../../../../database/src/entities/Category";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  name: z.string(),
  createdBy: z.string(),
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
    const category = new Category();
    category.name = requestBody.name;
    category.createdBy = parseInt(requestBody.createdBy);
    await upsertCategory(category);
    return {
      statusCode: 200,
      body: "Category created successfully",
    };
  } catch (error: any) {
    console.log("Error while creating Category: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});

