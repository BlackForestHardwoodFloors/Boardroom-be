import { Request, RequestHandler, Response } from "express";
import { sendResponse } from "../utils/response";
import { QuoteItem } from "../models/QuoteItem";

export const getItems: RequestHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const items = await QuoteItem.findAll();
    return sendResponse(res, 200, items, "Items fetched successfully");
  } catch (error) {
    console.log("Error while fetching quote items", JSON.stringify(error));
    return sendResponse(
      res,
      500,
      null,
      "Failed to fetch quote items , please try again later"
    );
  }
};

export const createItem: RequestHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { name } = req.body;
    const newItem = await QuoteItem.create({
      name,
    });
    return sendResponse(res, 200, newItem, "Quote Item created sucesfully");
  } catch (error) {
    console.log("Error while creating item", JSON.stringify(error));
    return sendResponse(res, 500, null, "Failed to create item");
  }
};