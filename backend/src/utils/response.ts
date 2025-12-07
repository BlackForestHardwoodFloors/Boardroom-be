import { Response } from 'express';

/**
 * Sends a JSON response for success and error scenarios.
 * @param {Response} res - The response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {object | null} data - The data to send in the response (default: null).
 * @param {string} message - A message to include in the response (default: 'Request failed').
 * @returns {Response} The response object.
 */
const sendResponse = (
  res: Response, 
  statusCode: number, 
  data: object | null = null, 
  message: string = ''
): Response => { 
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    message: message || (statusCode === 200 ? 'Request successful' : 'Request failed'),
    data: data || null,
  };
  return res.status(statusCode).json(response);  
};

export { sendResponse };