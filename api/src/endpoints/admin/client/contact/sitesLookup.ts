/* eslint-disable @typescript-eslint/no-explicit-any */
import { initialize } from "../../../../../../database/src/data-source";
import { requestHandler } from "../../../../utils/helper.utils";
import { listContactSiteLookup } from "../../../../../../database/src/operations/admin/client/listContactSiteLookup";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const clientContacts = await listContactSiteLookup();
    const result = clientContacts.map(item => {
        return {
            id: item.id,
            name: `${item.firstName} ${item.lastName}`,
            accountId: item.clientAccount.id,
            accountName: item.clientAccount.name,
            salesAssociateId: item.clientAccount.salesAssociateId,
            salesAssociateName: `${item.clientAccount.salesAssociate.first_name} ${item.clientAccount.salesAssociate.last_name}`,
            salesManagerId: item.clientAccount.salesManagerId,
            salesManagerName: `${item.clientAccount.salesManager.first_name} ${item.clientAccount.salesManager.last_name}`,
            operationalAssociateId: item.clientAccount.operationalAssociateId,
            operationalAssociateName: `${item.clientAccount.operationalAssociate.first_name} ${item.clientAccount.operationalAssociate.last_name}`,
            operationalManagerId: item.clientAccount.operationalManagerId,
            operationalManagerName: `${item.clientAccount.operationalManager.first_name} ${item.clientAccount.operationalManager.last_name}`,
        }
    });
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing client contact sites lookup: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
