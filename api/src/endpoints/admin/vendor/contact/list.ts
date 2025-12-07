/* eslint-disable @typescript-eslint/no-explicit-any */
import { initialize } from "../../../../../../database/src/data-source";
import { requestHandler } from "../../../../utils/helper.utils";
import { listVendorContacts } from "../../../../../../database/src/operations/listVendorContacts";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const vendorContacts = await listVendorContacts();
    const result = vendorContacts.map(item => {
        return {
            ...item,
            name: `${item.firstName} ${item.lastName}`,
            createdBy: `${item.createdByUser.first_name} ${item.createdByUser.last_name}`,
            accountName: item.vendorAccount.name,
            accountId: item.vendorAccountId,
            salesAssociate: item.salesAssociateId,
            salesManager: item.salesManagerId,
            operationalAssociate: item.operationalAssociateId,
            operationalManager: item.operationalManagerId,
            zip: item.zipCode
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