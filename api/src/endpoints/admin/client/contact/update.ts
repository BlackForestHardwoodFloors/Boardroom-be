/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../../../database/src/data-source";
import { authenticateUser } from "../../../../../../database/src/operations/authenticateUser";
import { requestHandler } from "../../../../utils/helper.utils";
import { getUser } from "../../../../../../database/src/operations/getUser";
import { upsertClientContact } from "../../../../../../database/src/operations/upsertClientContact";
import { ClientContact, ClientContactStatus } from "../../../../../../database/src/entities/ClientContact";

/* eslint-disable camelcase */
const BODY_SCHEMA = z.object({
  id: z.string(),
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
  status: z.string(),
  portalAccess: z.boolean(),
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
    const clientContact = new ClientContact();
    clientContact.id = parseInt(requestBody.id);
    clientContact.clientAccountId = parseInt(requestBody.accountId);
    clientContact.firstName = requestBody.firstName;
    clientContact.lastName = requestBody.lastName;
    clientContact.email = requestBody.email;
    clientContact.phone = requestBody.phone?.toString() || "" ;
    clientContact.street = requestBody.street || "";
    clientContact.city = requestBody.city || "";
    clientContact.zipCode = requestBody.zip;
    clientContact.state = requestBody.state;
    clientContact.country = requestBody.country;
    clientContact.status = requestBody.status as ClientContactStatus;
    clientContact.portalAccess = requestBody.portalAccess;
    clientContact.operationalAssociateId = parseInt(requestBody.operationalAssociate);
    clientContact.operationalManagerId = parseInt(requestBody.operationalManager);
    clientContact.salesAssociateId = parseInt(requestBody.salesAssociate);
    clientContact.salesManagerId = parseInt(requestBody.salesManager);
    clientContact.modifiedBy = parseInt(requestBody.modifiedBy);
    await upsertClientContact(clientContact);
    return {
      statusCode: 200,
      body: "Client contact updated successfully",
    };
  } catch (error: any) {
    console.log("Error while updating vendor contact: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});
