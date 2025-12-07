/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { authenticateUser } from "../../../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../../../utils/helper.utils";
import { listClientAccounts } from "../../../../../../database/src/operations/admin/client/listClientAccounts";
import { ClientAccount } from "../../../../../../database/src/entities/ClientAccount";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const clientAccounts = await listClientAccounts();
    const result = clientAccounts.map(item => {
        return {
            ...item,
            salesAssociate: item.salesAssociateId,
            salesManager: item.salesManagerId,
            operationalAssociate: item.operationalAssociateId,
            operationalManager: item.operationalManagerId,
            zip: item.zipCode,
            createdBy: `${item.createdByUser.first_name} ${item.createdByUser.last_name}`,
        }
    });
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing Client Accounts: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
