/**
 * Communications Routes - Boardroom 360 Backend
 * 
 * Routes for SMS and Email functionality
 * Place this file in: backend/src/routes/communicationsRoutes.ts
 */

import express from 'express';
import {
  sendSMS,
  sendEmail,
  sendBulkSMS,
  sendBulkEmail,
  getStatus
} from '../controllers/communicationsController';
import { authenticateToken } from '../middleware/authentication';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

/**
 * @route   POST /communications/send-sms
 * @desc    Send a single SMS message
 * @access  Private
 * @body    { phone: string, message: string, type?: string }
 */
router.post('/send-sms', sendSMS as any);

/**
 * @route   POST /communications/send-email
 * @desc    Send a single email
 * @access  Private
 * @body    { email: string, subject: string, body: string, type?: string, html?: string }
 */
router.post('/send-email', sendEmail as any);

/**
 * @route   POST /communications/send-bulk-sms
 * @desc    Send SMS to multiple recipients
 * @access  Private
 * @body    { recipients: string[], message: string, type?: string }
 */
router.post('/send-bulk-sms', sendBulkSMS as any);

/**
 * @route   POST /communications/send-bulk-email
 * @desc    Send email to multiple recipients
 * @access  Private
 * @body    { recipients: string[], subject: string, body: string, type?: string, html?: string }
 */
router.post('/send-bulk-email', sendBulkEmail as any);

/**
 * @route   GET /communications/status
 * @desc    Get communication service status
 * @access  Private
 */
router.get('/status', getStatus as any);

export default router;
