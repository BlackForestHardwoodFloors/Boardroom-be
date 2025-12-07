/* eslint-disable @typescript-eslint/no-explicit-any */
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { listUsers } from "../../../../database/src/operations/users/listUsers";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const users = await listUsers();
    const result = users.map(item => {
      return {
        ...item,
        name: `${item.firstName} ${item.lastName}`,
        createdBy: `${item.creator_first_name} ${item.creator_last_name}`,
      }
    });

    console.log("Result: ", result);
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing vendor contacts: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});