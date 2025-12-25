/**
 * Employee Location Routes - Boardroom 360 Backend
 * 
 * Routes for employee GPS location tracking.
 */

import express from 'express';
import {
  updateLocation,
  getLocation,
  getLocations,
  deleteLocation,
  getAllLocations
} from '../controllers/employeeLocationController';

const router = express.Router();

/**
 * @route   POST /employee/location
 * @desc    Update employee's current location
 * @access  Private
 * @body    { employeeId, latitude, longitude, accuracy?, timestamp?, address?, source? }
 */
router.post('/location', updateLocation as any);

/**
 * @route   GET /employee/locations/all
 * @desc    Get all employee locations (for admin map view)
 * @access  Private (admin only)
 * Note: This must come BEFORE /:id/location to avoid conflict
 */
router.get('/locations/all', getAllLocations as any);

/**
 * @route   POST /employee/locations
 * @desc    Get locations for multiple employees
 * @access  Private
 * @body    { employeeIds: number[] }
 */
router.post('/locations', getLocations as any);

/**
 * @route   GET /employee/:id/location
 * @desc    Get a specific employee's location
 * @access  Private
 */
router.get('/:id/location', getLocation as any);

/**
 * @route   DELETE /employee/:id/location
 * @desc    Delete employee's location data
 * @access  Private
 */
router.delete('/:id/location', deleteLocation as any);

export default router;
