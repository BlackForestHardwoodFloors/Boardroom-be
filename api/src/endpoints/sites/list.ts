/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { listSite } from "../../../../database/src/operations/site/listSite";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const Site = await listSite();
    const result = Site.map(item => ({
      id: item.id,
      street: item.street,
      city: item.city,
      state: item.state,
      country: item.country,
      zip: item.zipCode,
      mapLink: item.mapLink,
      portalAccess: item.portalAccess,
      contactId: item.contactId,
      accountId: item.accountId,
      status: item.status,
      operationalAssociate: item.operationalAssociateId,
      operationalManager: item.operationalManagerId,
      salesAssociate: item.salesAssociateId,
      salesManager: item.salesManagerId,
      locationName: item.locationName,
      siteNumber: item.siteNumber,
      accountName: item.account.name,
      contactName: item.contact.firstName + " " + item.contact.lastName,
      createdBy: item.createdByUser.first_name + " " + item.createdByUser.last_name,
      createdAt: item.createdTime,
      modifiedBy:item.modifiedBy,
      modifiedTime:item.modifiedTime,
    }));
    console.log(result)
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing Site: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});