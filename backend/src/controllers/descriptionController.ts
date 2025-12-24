import { Request, RequestHandler, Response } from 'express';
import { Description } from '../models/Description';
import { sendResponse } from '../utils/response';

// Get all descriptions, ordered by lastUsed (most recent first)
export const getDescriptions: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const descriptions = await Description.findAll({
      order: [['lastUsed', 'DESC']],
    });
    return sendResponse(res, 200, descriptions, "Descriptions fetched successfully");
  } catch (error) {
    console.log("Error fetching descriptions:", error);
    return sendResponse(res, 500, null, "An error occurred while fetching descriptions");
  }
};

// Create a new description
export const createDescription: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, color, isJobType } = req.body;

    if (!name) {
      return sendResponse(res, 400, null, "Name is required");
    }

    // Check if already exists
    const existing = await Description.findOne({ where: { name } });
    if (existing) {
      return sendResponse(res, 400, null, "Description already exists");
    }

    const newDescription = await Description.create({
      name,
      color: isJobType ? null : (color || '#C9A049'),
      isJobType: isJobType || false,
      lastUsed: new Date(),
    });

    return sendResponse(res, 201, newDescription, "Description created successfully");
  } catch (error) {
    console.log("Error creating description:", error);
    return sendResponse(res, 500, null, "An error occurred while creating description");
  }
};

// Update a description (color, isJobType, or mark as used)
export const updateDescription: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, color, isJobType, markUsed } = req.body;

    const description = await Description.findByPk(id);
    if (!description) {
      return sendResponse(res, 404, null, "Description not found");
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (isJobType !== undefined) {
      updateData.isJobType = isJobType;
      // Clear color if it's a job type
      if (isJobType) updateData.color = null;
    }
    if (markUsed) updateData.lastUsed = new Date();

    await Description.update(updateData, { where: { id } });
    
    const updated = await Description.findByPk(id);
    return sendResponse(res, 200, updated, "Description updated successfully");
  } catch (error) {
    console.log("Error updating description:", error);
    return sendResponse(res, 500, null, "An error occurred while updating description");
  }
};

// Update lastUsed and optionally color when a description is selected
export const useDescription: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return sendResponse(res, 400, null, "Name is required");
    }

    let description = await Description.findOne({ where: { name } });
    
    if (!description) {
      // Create new description if it doesn't exist
      description = await Description.create({
        name,
        color: color || '#C9A049',
        isJobType: false,
        lastUsed: new Date(),
      });
    } else {
      // Update lastUsed and color if provided (and not a job type)
      const updateData: any = { lastUsed: new Date() };
      if (color && !description.isJobType) {
        updateData.color = color;
      }
      await Description.update(updateData, { where: { name } });
      description = await Description.findOne({ where: { name } });
    }

    return sendResponse(res, 200, description, "Description used successfully");
  } catch (error) {
    console.log("Error using description:", error);
    return sendResponse(res, 500, null, "An error occurred");
  }
};

// Delete a description
export const deleteDescription: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const description = await Description.findByPk(id);
    if (!description) {
      return sendResponse(res, 404, null, "Description not found");
    }

    await Description.destroy({ where: { id } });
    return sendResponse(res, 200, null, "Description deleted successfully");
  } catch (error) {
    console.log("Error deleting description:", error);
    return sendResponse(res, 500, null, "An error occurred while deleting description");
  }
};
