import { RequestHandler, Response } from 'express';
import { IGetUserAuthInfoRequest } from '../middleware/authentication';
import { sendResponse } from '../utils/response';
import { MessageType, PinpointSMSVoiceV2Client, SendTextMessageCommand } from "@aws-sdk/client-pinpoint-sms-voice-v2";
import { getErrorMessage } from '../utils/helper';
import { Message } from '../models/Message';
import { sendSms as sendSmsUtil  } from '../utils/sendSms'

export const sendSms: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<void> => {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
        sendResponse(res, 400, null, "Phone number and message are required.");
        return;
    }

    try {
        const response = await sendSmsUtil({ phoneNumber, message });

        // Store in database instead of S3
        await Message.create({
            messageId: response.messageId,
            phoneNumber: phoneNumber,
            message: message,
            direction: 'outbound',
            status: 'sent',
            timestamp: new Date().toISOString(),
            originationNumber: process.env.AWS_SNS_ORIGINATION_NUMBER!
        });

        sendResponse(res, 200, { messageId: response.messageId }, "SMS sent successfully");
        return;

    } catch (err) {
        console.error("Failed to send message:", err);
        const errorMessage = getErrorMessage(err);
        sendResponse(res, 400, null, errorMessage);
        return;
    }
};

export const getMessageHistory: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { phoneNumber } = req.params;

    try {
        const messages = await Message.findAll({
            where: { phoneNumber, delete: 'No' },
            order: [['timestamp', 'ASC']],
            attributes: { exclude: ['delete'] }
        });

        sendResponse(res, 200, { messages }, "Message history retrieved successfully");
    } catch (err) {
        console.error('Database Error:', err);
        sendResponse(res, 500, null, "Failed to retrieve message history");
    }
};

