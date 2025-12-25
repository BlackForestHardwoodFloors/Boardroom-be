import { RequestHandler, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../middleware/authentication';
import { sendResponse } from '../utils/response';
import { getErrorMessage } from '../utils/helper';
import { sendSms } from '../utils/sendSms';
import { Message } from '../models/Message';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Get all employees for messaging
export const getEmployeesForMessaging: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
  try {
    const employees = await sequelize.query(
      `SELECT id, \`First Name\` as firstName, \`Last Name\` as lastName, Email as email, Phone as phone, Status as status 
       FROM employees 
       WHERE Status = 'Active' AND (\`delete\` IS NULL OR \`delete\` = '')
       ORDER BY \`First Name\` ASC`,
      { type: QueryTypes.SELECT }
    );
    
    sendResponse(res, 200, { employees }, "Employees retrieved successfully");
  } catch (err) {
    console.error("Failed to get employees:", err);
    const errorMessage = getErrorMessage(err);
    sendResponse(res, 500, null, errorMessage);
  }
};

// Get all contacts/clients for messaging
export const getContactsForMessaging: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
  try {
    const contacts = await sequelize.query(
      `SELECT id, \`First Name\` as firstName, \`Last Name\` as lastName, \`Company Name\` as companyName, Email as email, Phone as phone 
       FROM contacts 
       WHERE (\`delete\` IS NULL OR \`delete\` = '')
       ORDER BY \`First Name\` ASC`,
      { type: QueryTypes.SELECT }
    );
    
    sendResponse(res, 200, { contacts }, "Contacts retrieved successfully");
  } catch (err) {
    console.error("Failed to get contacts:", err);
    const errorMessage = getErrorMessage(err);
    sendResponse(res, 500, null, errorMessage);
  }
};

// Send message to multiple recipients
export const sendBroadcastMessage: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
  const { recipients, message, messageType } = req.body;
  
  // recipients = [{ id, type: 'employee' | 'contact', phone, name }]
  // messageType = 'sms' | 'inapp'
  
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    sendResponse(res, 400, null, "At least one recipient is required");
    return;
  }
  
  if (!message || !message.trim()) {
    sendResponse(res, 400, null, "Message is required");
    return;
  }
  
  if (!messageType || !['sms', 'inapp'].includes(messageType)) {
    sendResponse(res, 400, null, "Message type must be 'sms' or 'inapp'");
    return;
  }
  
  const results: { success: any[]; failed: any[] } = { success: [], failed: [] };
  
  try {
    for (const recipient of recipients) {
      try {
        if (messageType === 'sms') {
          // Send SMS
          if (!recipient.phone) {
            results.failed.push({ ...recipient, error: 'No phone number' });
            continue;
          }
          
          const response = await sendSms({ phoneNumber: recipient.phone, message });
          
          // Store in database
          await Message.create({
            messageId: response.messageId,
            phoneNumber: recipient.phone,
            message: message,
            direction: 'outbound',
            status: 'sent',
            timestamp: new Date().toISOString(),
            originationNumber: process.env.AWS_SNS_ORIGINATION_NUMBER || ''
          });
          
          results.success.push({ ...recipient, messageId: response.messageId });
        } else {
          // In-app message - store in messages table
          await Message.create({
            messageId: `inapp-${Date.now()}-${recipient.id}`,
            phoneNumber: recipient.phone || '',
            message: message,
            direction: 'outbound',
            status: 'delivered',
            timestamp: new Date().toISOString(),
            recipientId: recipient.id,
            recipientType: recipient.type,
            originationNumber: 'in-app'
          });
          
          results.success.push({ ...recipient, messageId: `inapp-${recipient.id}` });
        }
      } catch (err) {
        console.error(`Failed to send to ${recipient.name}:`, err);
        results.failed.push({ ...recipient, error: getErrorMessage(err) });
      }
    }
    
    const totalSent = results.success.length;
    const totalFailed = results.failed.length;
    
    sendResponse(res, 200, results, `Sent ${totalSent} message(s), ${totalFailed} failed`);
  } catch (err) {
    console.error("Broadcast failed:", err);
    const errorMessage = getErrorMessage(err);
    sendResponse(res, 500, null, errorMessage);
  }
};