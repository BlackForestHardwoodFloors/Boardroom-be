import { Request, Response } from 'express';

/**
 * Validates if all required fields are present in the request body.
 * @param {string[]} requiredFields - An array of field names that must be present in the request body.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {boolean} - Returns false if any required fields are missing, otherwise true.
 */
export const validateFields = (requiredFields: string[], req: Request, res: Response): boolean => {
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    res.status(400).json({ 
      message: 'Missing required fields', 
      missingFields 
    });
    return false;
  }

  return true;
};