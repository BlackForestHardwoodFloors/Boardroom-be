/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { authenticateUser } from "../../../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../../../utils/helper.utils";
import { listVendorAccounts } from "../../../../../../database/src/operations/admin/vendor/listVendorAccounts";
import { VendorAccount } from "../../../../../../database/src/entities/VendorAccount";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const vendorAccounts = await listVendorAccounts();
    const result = vendorAccounts.map(item => {
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
    console.log("Error while listing vendor contacts: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
