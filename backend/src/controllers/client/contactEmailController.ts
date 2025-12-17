import { RequestHandler, Response } from "express";
import { ContactEmail } from "../../models/ContactEmail";
import { sendResponse } from "../../utils/response";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";

export const createContactEmail: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId, name, email, isPrimary, receiveNotifications } = req.body;
    if (!contactId || !email) {
      return sendResponse(res, 400, null, "contactId and email are required");
    }
    const emailRecord = await ContactEmail.create({
      contactId,
      name: name || null,
      email,
      isPrimary: isPrimary || false,
      receiveNotifications: receiveNotifications !== false
    });
    return sendResponse(res, 201, emailRecord, "Email created successfully");
  } catch (error) {
    console.log("Error creating contact email", error);
    return sendResponse(res, 500, null, "An error occurred while creating the email");
  }
};

export const createContactEmails: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId, emails } = req.body;
    if (!contactId || !emails || !Array.isArray(emails)) {
      return sendResponse(res, 400, null, "contactId and emails array are required");
    }
    const validEmails = emails.filter((e: any) => e.email && e.email.trim());
    if (validEmails.length === 0) {
      return sendResponse(res, 400, null, "At least one valid email is required");
    }
    const emailRecords = validEmails.map((email: any, index: number) => ({
      contactId,
      name: email.name || null,
      email: email.email.trim(),
      isPrimary: index === 0,
      receiveNotifications: true
    }));
    const createdEmails = await ContactEmail.bulkCreate(emailRecords);
    return sendResponse(res, 201, createdEmails, "Emails created successfully");
  } catch (error) {
    console.log("Error creating contact emails", error);
    return sendResponse(res, 500, null, "An error occurred while creating emails");
  }
};

export const getContactEmails: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId } = req.params;
    const emails = await ContactEmail.findAll({ where: { contactId } });
    return sendResponse(res, 200, emails, "Emails found");
  } catch (error) {
    console.log("Error fetching contact emails", error);
    return sendResponse(res, 500, null, "An error occurred while fetching emails");
  }
};

export const updateContactEmail: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const email = await ContactEmail.findByPk(id);
    if (!email) {
      return sendResponse(res, 404, null, "Email not found");
    }
    await email.update(req.body);
    return sendResponse(res, 200, email, "Email updated successfully");
  } catch (error) {
    console.log("Error updating contact email", error);
    return sendResponse(res, 500, null, "An error occurred while updating the email");
  }
};

export const deleteContactEmail: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const email = await ContactEmail.findByPk(id);
    if (!email) {
      return sendResponse(res, 404, null, "Email not found");
    }
    await email.destroy();
    return sendResponse(res, 200, null, "Email deleted successfully");
  } catch (error) {
    console.log("Error deleting contact email", error);
    return sendResponse(res, 500, null, "An error occurred while deleting the email");
  }
};

export const deleteAllContactEmails: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId } = req.params;
    await ContactEmail.destroy({ where: { contactId } });
    return sendResponse(res, 200, null, "All emails deleted successfully");
  } catch (error) {
    console.log("Error deleting contact emails", error);
    return sendResponse(res, 500, null, "An error occurred while deleting emails");
  }
};