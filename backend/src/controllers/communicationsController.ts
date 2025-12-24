/**
 * Communications Controller - Boardroom 360 Backend
 * 
 * Handles sending SMS and Email notifications
 * Place this file in: backend/src/controllers/communicationsController.ts
 */

import { Request, Response } from 'express';
import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Twilio configuration (set these in your .env file)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Email configuration (set these in your .env file)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@boardroom360.com';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// Initialize Nodemailer transporter
let emailTransporter: nodemailer.Transporter | null = null;
if (SMTP_USER && SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

/**
 * Send SMS via Twilio
 */
export const sendSMS = async (req: Request, res: Response) => {
  try {
    const { phone, message, type } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        message: 'SMS service not configured. Please set up Twilio credentials.'
      });
    }

    // Format phone number (ensure it has country code)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Send SMS
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    // Log the message
    console.log(`SMS sent to ${formattedPhone}: ${result.sid}`);

    // Store in database (optional - add your logging logic here)
    // await CommunicationLog.create({
    //   channel: 'sms',
    //   recipient: formattedPhone,
    //   content: message,
    //   type: type || 'general',
    //   status: 'sent',
    //   externalId: result.sid
    // });

    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      data: {
        sid: result.sid,
        status: result.status
      }
    });
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS'
    });
  }
};

/**
 * Send Email via Nodemailer
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { email, subject, body, type, html } = req.body;

    if (!email || !subject || (!body && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Email, subject, and body are required'
      });
    }

    if (!emailTransporter) {
      return res.status(503).json({
        success: false,
        message: 'Email service not configured. Please set up SMTP credentials.'
      });
    }

    // Build email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: subject,
      text: body,
      html: html || body.replace(/\n/g, '<br>')
    };

    // Send email
    const result = await emailTransporter.sendMail(mailOptions);

    console.log(`Email sent to ${email}: ${result.messageId}`);

    // Store in database (optional)
    // await CommunicationLog.create({
    //   channel: 'email',
    //   recipient: email,
    //   subject: subject,
    //   content: body,
    //   type: type || 'general',
    //   status: 'sent',
    //   externalId: result.messageId
    // });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        messageId: result.messageId
      }
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email'
    });
  }
};

/**
 * Send bulk SMS to multiple recipients
 */
export const sendBulkSMS = async (req: Request, res: Response) => {
  try {
    const { recipients, message, type } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required'
      });
    }

    if (!twilioClient) {
      return res.status(503).json({
        success: false,
        message: 'SMS service not configured'
      });
    }

    const results = await Promise.allSettled(
      recipients.map(async (phone: string) => {
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
          formattedPhone = `+1${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = `+${formattedPhone}`;
        }

        return twilioClient!.messages.create({
          body: message,
          from: TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      message: `Sent ${successful} of ${recipients.length} messages`,
      data: {
        successful,
        failed,
        total: recipients.length
      }
    });
  } catch (error: any) {
    console.error('Error sending bulk SMS:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk SMS'
    });
  }
};

/**
 * Send bulk Email to multiple recipients
 */
export const sendBulkEmail = async (req: Request, res: Response) => {
  try {
    const { recipients, subject, body, type, html } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required'
      });
    }

    if (!emailTransporter) {
      return res.status(503).json({
        success: false,
        message: 'Email service not configured'
      });
    }

    const results = await Promise.allSettled(
      recipients.map(async (email: string) => {
        return emailTransporter!.sendMail({
          from: EMAIL_FROM,
          to: email,
          subject: subject,
          text: body,
          html: html || body.replace(/\n/g, '<br>')
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({
      success: true,
      message: `Sent ${successful} of ${recipients.length} emails`,
      data: {
        successful,
        failed,
        total: recipients.length
      }
    });
  } catch (error: any) {
    console.error('Error sending bulk email:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk email'
    });
  }
};

/**
 * Get communication status (check if services are configured)
 */
export const getStatus = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      sms: {
        configured: !!twilioClient,
        provider: 'Twilio'
      },
      email: {
        configured: !!emailTransporter,
        provider: 'SMTP'
      }
    }
  });
};

export default {
  sendSMS,
  sendEmail,
  sendBulkSMS,
  sendBulkEmail,
  getStatus
};
