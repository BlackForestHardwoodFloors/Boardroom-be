import { Request, RequestHandler, Response } from 'express';

import { sendResponse } from "../../utils/response";
import { Employee } from '../../models/Employee';
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest, userDataCache } from '../../middleware/authentication';
import bcrypt from 'bcryptjs';
import { Jobs } from '../../models/Jobs';

interface EmployeeRequestBody {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    status: string;
    department: string;
    reportingManager: string;
    rolesPermissions: string;
    color: string
    portalStatus: string;
    password: string;
}

export const getEmployees: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const employees = await Employee.findAll({
            where: { delete: 'No' },
            order: [['id', 'ASC']]
        });
        return sendResponse(res, 200, employees, "Employees fetched successfully");
    } catch (error) {
        console.log("Error while fetching employees", error);
        return sendResponse(res, 500, null, "An error occurred while fetching employees");
    }
}

export const createEmployee: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            status,
            department,
            rolesPermissions,
            reportingManager,
            color,
            portalStatus,
            password
        }: EmployeeRequestBody = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'rolesPermissions', 'reportingManager'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const existingEmployee = await Employee.findOne({ where: { email } });
        if (existingEmployee) {
            return sendResponse(res, 400, null, "A employee with this email already exists");
        }       

        const newEmployee = await Employee.create({
            firstName,
            lastName,
            phone,
            email,
            status,
            department,
            rolesPermissions,
            reportingManager,
            color,
            portalStatus,
            password: hashedPassword,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newEmployee, "Employee created successfully");
    } catch (error) {
        console.log("Error while creating employee", error);
        return sendResponse(res, 500, null, "An error occurred while creating the employee");
    }
}

export const updateEmployee: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            firstName,
            lastName,
            phone,
            email,
            status,
            department,
            rolesPermissions,
            reportingManager,
            color,
            portalStatus,
            password
        }: Partial<EmployeeRequestBody> = req.body;

        const existingEmployee = await Employee.findOne({ where: { id } });
        if (!existingEmployee) {
            return sendResponse(res, 404, null, "Employee not found");
        }

        const updatedFields: any = {
            modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
            modifiedTime: new Date().toISOString()
        };

        if (firstName !== undefined) updatedFields.firstName = firstName;
        if (lastName !== undefined) updatedFields.lastName = lastName;
        if (phone !== undefined) updatedFields.phone = phone;
        if (email !== undefined) updatedFields.email = email;
        if (status !== undefined) updatedFields.status = status;
        if (department !== undefined) updatedFields.department = department;
        if (rolesPermissions !== undefined) updatedFields.rolesPermissions = rolesPermissions;
        if (reportingManager !== undefined) updatedFields.reportingManager = reportingManager;
        if (color !== undefined) updatedFields.color = color;
        if (portalStatus !== undefined) updatedFields.portalStatus = portalStatus;
        if (password !== undefined && password !== "") {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        await Employee.update(updatedFields, { where: { id } });
        if (portalStatus !== undefined) {
            userDataCache.del(id);
        }

        return sendResponse(res, 200, updatedFields, "Employee updated successfully");
    } catch (error) {
        console.log("Error while updating employee", error);
        return sendResponse(res, 500, null, "An error occurred while updating the employee");
    }
}

export const deleteEmployee: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // 1. Soft delete the employee
        await Employee.update(
            { delete: 'Yes' },
            { where: { id } }
        );

        // 2. Remove employee ID from all job's assignedEmployee array
        const jobs: any = await Jobs.findAll();

        for (const job of jobs) {
            let assigned = job.assignedEmployee;

            // Make sure assignedEmployee is parsed if stored as JSON/string
            if (typeof assigned === 'string') {
                assigned = JSON.parse(assigned);
            }

            if (Array.isArray(assigned) && assigned.includes(id)) {
                const updatedAssigned = assigned.filter((empId: string) => empId !== id);

                await Jobs.update(
                    { assignedEmployee: JSON.stringify(updatedAssigned) },
                    { where: { id: job.id } }
                );
            }
        }

        return sendResponse(res, 201, null, "Employee deleted and removed from jobs successfully");

    } catch (error) {
        console.log("Error while deleting Employee", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Employee");
    }
};
