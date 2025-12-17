import { RequestHandler, Response } from "express";
import { ContactPhone } from "../../models/ContactPhone";
import { sendResponse } from "../../utils/response";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";

export const createContactPhone: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId, name, number, type, isPrimary, receiveSMS } = req.body;
    if (!contactId || !number) {
      return sendResponse(res, 400, null, "contactId and number are required");
    }
    const phone = await ContactPhone.create({
      contactId,
      name: name || null,
      number,
      type: type || "Mobile",
      isPrimary: isPrimary || false,
      receiveSMS: receiveSMS !== false
    });
    return sendResponse(res, 201, phone, "Phone number created successfully");
  } catch (error) {
    console.log("Error creating contact phone", error);
    return sendResponse(res, 500, null, "An error occurred while creating the phone number");
  }
};

export const createContactPhones: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId, phones } = req.body;
    if (!contactId || !phones || !Array.isArray(phones)) {
      return sendResponse(res, 400, null, "contactId and phones array are required");
    }
    const validPhones = phones.filter((p: any) => p.number && p.number.trim());
    if (validPhones.length === 0) {
      return sendResponse(res, 400, null, "At least one valid phone number is required");
    }
    const phoneRecords = validPhones.map((phone: any, index: number) => ({
      contactId,
      name: phone.name || null,
      number: phone.number.trim(),
      type: phone.type || "Mobile",
      isPrimary: index === 0,
      receiveSMS: true
    }));
    const createdPhones = await ContactPhone.bulkCreate(phoneRecords);
    return sendResponse(res, 201, createdPhones, "Phone numbers created successfully");
  } catch (error) {
    console.log("Error creating contact phones", error);
    return sendResponse(res, 500, null, "An error occurred while creating phone numbers");
  }
};

export const getContactPhones: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId } = req.params;
    const phones = await ContactPhone.findAll({ where: { contactId } });
    return sendResponse(res, 200, phones, "Phone numbers found");
  } catch (error) {
    console.log("Error fetching contact phones", error);
    return sendResponse(res, 500, null, "An error occurred while fetching phone numbers");
  }
};

export const updateContactPhone: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const phone = await ContactPhone.findByPk(id);
    if (!phone) {
      return sendResponse(res, 404, null, "Phone number not found");
    }
    await phone.update(req.body);
    return sendResponse(res, 200, phone, "Phone number updated successfully");
  } catch (error) {
    console.log("Error updating contact phone", error);
    return sendResponse(res, 500, null, "An error occurred while updating the phone number");
  }
};

export const deleteContactPhone: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const phone = await ContactPhone.findByPk(id);
    if (!phone) {
      return sendResponse(res, 404, null, "Phone number not found");
    }
    await phone.destroy();
    return sendResponse(res, 200, null, "Phone number deleted successfully");
  } catch (error) {
    console.log("Error deleting contact phone", error);
    return sendResponse(res, 500, null, "An error occurred while deleting the phone number");
  }
};

export const deleteAllContactPhones: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const { contactId } = req.params;
    await ContactPhone.destroy({ where: { contactId } });
    return sendResponse(res, 200, null, "All phone numbers deleted successfully");
  } catch (error) {
    console.log("Error deleting contact phones", error);
    return sendResponse(res, 500, null, "An error occurred while deleting phone numbers");
  }
};