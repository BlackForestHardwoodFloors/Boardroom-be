/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { authenticateUser } from "../../../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../../../utils/helper.utils";
import { getUser } from "../../../../../../database/src/operations/getUser";
import { upsertVendorContact } from "../../../../../../database/src/operations/upsertVendorContact";
import { VendorContact, VendorContactStatus } from "../../../../../../database/src/entities/VendorContact";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  accountId: z.string(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string(),
  state: z.string(),
  country: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  portalAccess: z.boolean(),
  operationalAssociate: z.string(),
  operationalManager: z.string(),
  salesAssociate: z.string(),
  salesManager: z.string(),
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
    const vendorContact = new VendorContact();
    vendorContact.vendorAccountId = parseInt(requestBody.accountId);
    vendorContact.firstName = requestBody.firstName;
    vendorContact.lastName = requestBody.lastName;
    vendorContact.email = requestBody.email;
    vendorContact.phone = requestBody.phone?.toString() || "" ;
    vendorContact.street = requestBody.street || "";
    vendorContact.city = requestBody.city || "";
    vendorContact.zipCode = requestBody.zip;
    vendorContact.state = requestBody.state;
    vendorContact.country = requestBody.country;
    vendorContact.status = requestBody.status as VendorContactStatus;
    vendorContact.portalAccess = requestBody.portalAccess;
    vendorContact.operationalAssociateId = parseInt(requestBody.operationalAssociate);
    vendorContact.operationalManagerId = parseInt(requestBody.operationalManager);
    vendorContact.salesAssociateId = parseInt(requestBody.salesAssociate);
    vendorContact.salesManagerId = parseInt(requestBody.salesManager);
    vendorContact.createdBy = parseInt(requestBody.createdBy);
    await upsertVendorContact(vendorContact);
    return {
      statusCode: 200,
      body: "Vendor contact created successfully",
    };
  } catch (error: any) {
    console.log("Error while creating vendor contact: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
