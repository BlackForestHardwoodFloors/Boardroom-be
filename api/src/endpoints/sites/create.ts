/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { upsertSite } from "../../../../database/src/operations/site/upsertSite";
import { Site } from "../../../../database/src/entities/Site";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  locationName: z.string(),
  siteNumber: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zip: z.string(),
  mapLink: z.string(),
  portalAccess: z.boolean(),
  contactId: z.string(),
  accountId: z.string(),
  operationalAssociate: z.string(),
  operationalManager: z.string(),
  salesAssociate: z.string(),
  salesManager: z.string(),
  createdBy: z.string()
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
    const site = new Site();
    site.locationName = requestBody.locationName;
    site.siteNumber = requestBody.siteNumber;
    site.street = requestBody.street;
    site.city = requestBody.city;
    site.state = requestBody.state;
    site.country = requestBody.country;
    site.zipCode = requestBody.zip;
    site.mapLink = requestBody.mapLink;
    site.portalAccess = requestBody.portalAccess;
    site.contactId = parseInt(requestBody.contactId);
    site.accountId = parseInt(requestBody.accountId);
    site.operationalAssociateId = parseInt(requestBody.operationalAssociate);
    site.operationalManagerId = parseInt(requestBody.operationalManager);
    site.salesAssociateId = parseInt(requestBody.salesAssociate);
    site.salesManagerId = parseInt(requestBody.salesManager);
    site.createdBy = parseInt(requestBody.createdBy);

    await upsertSite(site);
    return {
      statusCode: 200,
      body: "Site created successfully",
    };
  } catch (error: any) {
    console.log("Error while creating Service: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});

