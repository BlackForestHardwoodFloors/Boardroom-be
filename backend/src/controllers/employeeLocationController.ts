/**
 * Employee Location Controller - Boardroom 360 Backend
 * 
 * Handles storing and retrieving employee GPS locations.
 * Uses Sequelize ORM.
 */

import { Request, Response } from 'express';
import { EmployeeLocation } from '../models/EmployeeLocation';
import { Employee } from '../models/Employee';

interface LocationBody {
  employeeId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  address?: string;
  source?: 'gps' | 'manual' | 'checkin';
}

/**
 * Update employee location
 * POST /employee/location
 */
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { employeeId, latitude, longitude, accuracy, timestamp, address, source } = req.body as LocationBody;

    if (!employeeId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, latitude, and longitude are required'
      });
    }

    // Check if location exists for this employee
    const existingLocation = await EmployeeLocation.findOne({
      where: { employeeId }
    });

    let location;

    if (existingLocation) {
      // Update existing location
      await existingLocation.update({
        latitude,
        longitude,
        accuracy: accuracy || 0,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        address: address || null,
        source: source || 'gps',
      });
      location = existingLocation;
    } else {
      // Create new location
      location = await EmployeeLocation.create({
        employeeId,
        latitude,
        longitude,
        accuracy: accuracy || 0,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        address: address || null,
        source: source || 'gps',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: { location }
    });
  } catch (error: any) {
    console.error('Error updating employee location:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
};

/**
 * Get employee location
 * GET /employee/:id/location
 */
export const getLocation = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.id);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const location = await EmployeeLocation.findOne({
      where: { employeeId }
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location found for this employee'
      });
    }

    return res.status(200).json({
      success: true,
      location: {
        employeeId: location.get('employeeId'),
        latitude: location.get('latitude'),
        longitude: location.get('longitude'),
        accuracy: location.get('accuracy'),
        timestamp: location.get('timestamp'),
        address: location.get('address'),
        source: location.get('source')
      }
    });
  } catch (error: any) {
    console.error('Error fetching employee location:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch location'
    });
  }
};

/**
 * Get multiple employee locations
 * POST /employee/locations
 */
export const getLocations = async (req: Request, res: Response) => {
  try {
    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({
        success: false,
        message: 'employeeIds array is required'
      });
    }

    const locations = await EmployeeLocation.findAll({
      where: {
        employeeId: employeeIds
      }
    });

    // Convert to a map keyed by employeeId
    const locationsMap: Record<number, any> = {};
    locations.forEach((loc: any) => {
      locationsMap[loc.employeeId] = {
        employeeId: loc.employeeId,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        accuracy: parseFloat(loc.accuracy) || 0,
        timestamp: loc.timestamp,
        address: loc.address,
        source: loc.source
      };
    });

    return res.status(200).json({
      success: true,
      locations: locationsMap
    });
  } catch (error: any) {
    console.error('Error fetching employee locations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch locations'
    });
  }
};

/**
 * Delete employee location
 * DELETE /employee/:id/location
 */
export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.id);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    await EmployeeLocation.destroy({
      where: { employeeId }
    });

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting employee location:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete location'
    });
  }
};

/**
 * Get all employee locations (admin only)
 * GET /employee/locations/all
 */
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await EmployeeLocation.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    return res.status(200).json({
      success: true,
      locations: locations.map((loc: any) => ({
        employeeId: loc.employeeId,
        employeeName: loc.employee ? `${loc.employee.firstName} ${loc.employee.lastName}` : 'Unknown',
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        accuracy: parseFloat(loc.accuracy) || 0,
        timestamp: loc.timestamp,
        address: loc.address,
        source: loc.source
      }))
    });
  } catch (error: any) {
    console.error('Error fetching all employee locations:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch locations'
    });
  }
};

export default {
  updateLocation,
  getLocation,
  getLocations,
  deleteLocation,
  getAllLocations
};
