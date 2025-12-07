/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { listCategory } from "../../../../database/src/operations/category/listCategory";
import { Category } from "../../../../database/src/entities/Category";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const Category = await listCategory();
    const result = Category.map(item => ({
      ...item,
      createdBy: `${item.createdByUser.first_name} ${item.createdByUser.last_name}`,
      createdByUser: {
          first_name: item.createdByUser.first_name,
          last_name: item.createdByUser.last_name,
      },
  }));
    console.log(result)
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing category: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});