/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { requestHandler } from "../../../../utils/helper.utils";
import { upsertClientAccount } from "../../../../../../database/src/operations/admin/client/upsertClientAccount";
import { ClientAccount, ClientAccountStatus } from "../../../../../../database/src/entities/ClientAccount";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  id: z.string(),
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
  modifiedBy: z.string(),
  modifiedTime: z.string(),
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
    const clientAccount = new ClientAccount();
    clientAccount.id = parseInt(requestBody.id);
    clientAccount.name = requestBody.name;
    clientAccount.email = requestBody.email;
    clientAccount.website = requestBody.website;
    clientAccount.phone = requestBody.phone?.toString() || "" ;
    clientAccount.street = requestBody.street || "";
    clientAccount.city = requestBody.city || "";
    clientAccount.zipCode = requestBody.zip;
    clientAccount.state = requestBody.state;
    clientAccount.country = requestBody.country;
    clientAccount.status = requestBody.status as ClientAccountStatus;
    clientAccount.operationalAssociateId = parseInt(requestBody.operationalAssociate);
    clientAccount.operationalManagerId = parseInt(requestBody.operationalManager);
    clientAccount.salesAssociateId = parseInt(requestBody.salesAssociate);
    clientAccount.salesManagerId = parseInt(requestBody.salesManager);
    clientAccount.modifiedBy = parseInt(requestBody.modifiedBy);
    clientAccount.modifiedTime = new Date(requestBody.modifiedTime);
    await upsertClientAccount(clientAccount);
    return {
      statusCode: 200,
      body: "Client account updated successfully",
    };
  } catch (error: any) {
    console.log("Error while updating client account: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
