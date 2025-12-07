/* eslint-disable @typescript-eslint/no-explicit-any */
import { initialize } from "../../../../../../database/src/data-source";
import { requestHandler } from "../../../../utils/helper.utils";
import { listClientContacts } from "../../../../../../database/src/operations/listClientContacts";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const clientContacts = await listClientContacts();
    const result = clientContacts.map(item => {
        return {
            ...item,
            name: `${item.firstName} ${item.lastName}`,
            createdBy: `${item.createdByUser.first_name} ${item.createdByUser.last_name}`,
            accountName: item.clientAccount.name,
            accountId: item.clientAccountId,
            salesAssociate: item.salesAssociateId,
            salesManager: item.salesManagerId,
            operationalAssociate: item.operationalAssociateId,
            operationalManager: item.operationalManagerId,
            zip: item.zipCode
        }
    });
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing Client contacts: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
