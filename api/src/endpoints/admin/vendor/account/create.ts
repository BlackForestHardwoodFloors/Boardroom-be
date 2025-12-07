/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { authenticateUser } from "../../../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../../../utils/helper.utils";
import { getUser } from "../../../../../../database/src/operations/getUser";
import { upsertVendorContact } from "../../../../../../database/src/operations/upsertVendorContact";
import { VendorContact } from "../../../../../../database/src/entities/VendorContact";
import { upsertVendorAccount } from "../../../../../../database/src/operations/admin/vendor/upsertVendorAccount";
import { VendorAccount, VendorAccountStatus } from "../../../../../../database/src/entities/VendorAccount";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  website: z.string(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string(),
  state: z.string(),
  country: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
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
    const vendorAccount = new VendorAccount();
    vendorAccount.name = requestBody.name;
    vendorAccount.email = requestBody.email;
    vendorAccount.website = requestBody.website;
    vendorAccount.phone = requestBody.phone?.toString() || "" ;
    vendorAccount.street = requestBody.street || "";
    vendorAccount.city = requestBody.city || "";
    vendorAccount.zipCode = requestBody.zip;
    vendorAccount.state = requestBody.state;
    vendorAccount.country = requestBody.country;
    vendorAccount.status = requestBody.status as VendorAccountStatus;
    vendorAccount.operationalAssociateId = parseInt(requestBody.operationalAssociate);
    vendorAccount.operationalManagerId = parseInt(requestBody.operationalManager);
    vendorAccount.salesAssociateId = parseInt(requestBody.salesAssociate);
    vendorAccount.salesManagerId = parseInt(requestBody.salesManager);
    vendorAccount.createdBy = parseInt(requestBody.createdBy);
    await upsertVendorAccount(vendorAccount);
    return {
      statusCode: 200,
      body: "Vendor account created successfully",
    };
  } catch (error: any) {
    console.log("Error while creating vendor account: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
