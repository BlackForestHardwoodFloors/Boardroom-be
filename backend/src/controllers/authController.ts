// @ts-nocheck
import { Request, RequestHandler, Response } from 'express';
import { User } from '../models/User';
import { sendResponse } from '../utils/response';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import moment from 'moment-timezone';
import { validateFields } from '../utils/validateFields';
import { Employee } from '../models/Employee';
import { RolePermission } from '../models/RolePermission';
import { Department } from '../models/Departments';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

export const login: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password }: { email: string; password: string } = req.body;

        const requiredFields = ['email', 'password'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }
        const user: any = await Employee.findOne({ where: { Email: email } });
        if (!user) {
            console.log(`User Not Found`);
            return sendResponse(res, 404, null, "User not found");
        }

        if (user.portalStatus === "Deactivated") {
            return sendResponse(res, 400, null, "Your account is inactive, please contact your administrator.");
        }

        const rolesAndPermissions: any = await RolePermission.findAll({
            where: { id: user.rolesPermissions }
        });
        const department: any = await Department.findAll({
            where: { id: user.department }
        });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Password is not valid!`);
            return sendResponse(res, 404, null, "Password is invalid, Please try again.");
        }

        if (user.portalStatus === "Invitation Sent") {
            await user.update({ portalStatus: "Active" });
        }

        // Set the token expiration on Sunday of PDT/PST timezone
        const currentTime = moment().tz('America/Los_Angeles');
        const daysUntilNextSunday = (7 - currentTime.day()) % 7 || 7;
        const expirationTime = currentTime.clone().add(daysUntilNextSunday, 'days').startOf('day');

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.firstName + ' ' + user.lastName,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.designationId,
                roleAndPermissionId: user.rolesPermissions,
                exp: expirationTime.unix()
            },
            jwtSecret,
        );
        console.log("token", token);

        return res.status(200).json({
            token,
            user: {
                ...user.toJSON(),
                role: rolesAndPermissions?.[0].role,
                department: department?.[0].departmentName
            }
        });
    } catch (error) {
        console.error('Error while signing in user', JSON.stringify(error));
        return sendResponse(res, 500, error.message, "An error occurred during login");
    }
};

export const resetPassword: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, tempPassword, newPassword }: { email: string; tempPassword: string; newPassword: string } = req.body;

        const user: any = await Employee.findOne({ where: { email } });
        if (!user) {
            return sendResponse(res, 404, null, 'User not found');
        }

        const isTempPasswordValid = user.password ? await bcrypt.compare(tempPassword, user.password) : false;
        if (!isTempPasswordValid) {
            return sendResponse(res, 401, null, 'Invalid temporary password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedNewPassword, tempPassword: null });

        return sendResponse(res, 200, null, 'Password reset successfully');
    } catch (error) {
        console.error('Error resetting password:', error);
        return sendResponse(res, 500, error.message, 'An error occurred while resetting the password');
    }
};

export const forgotPassword: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, newPassword, confirmPassword }: { email: string; newPassword: string; confirmPassword: string } = req.body;

        // Validate fields
        if (!email || !newPassword || !confirmPassword) {
            return sendResponse(res, 400, null, 'Email, new password, and confirm password are required');
        }

        if (newPassword !== confirmPassword) {
            return sendResponse(res, 400, null, 'Passwords do not match');
        }

        const user: any = await Employee.findOne({ where: { email } });

        if (!user) {
            return sendResponse(res, 404, null, 'User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        return sendResponse(res, 200, null, 'Password has been change successfully');
    } catch (error) {
        console.error('Error in forgot password:', error);
        return sendResponse(res, 500, error.message, 'An error occurred while changing the password');
    }
};
