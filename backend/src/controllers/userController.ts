import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserCreationAttributes } from '../models/User';
import { sendResponse } from '../utils/response';

export const createUser:RequestHandler  = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log(req.body);
        
        const { firstName, lastName, email, phone, password, createdBy, designationId, roleAndPermissionId } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            createdBy,
            createdTime: new Date(),
            designationId,
            roleAndPermissionId,
        } as UserCreationAttributes);
        return sendResponse(res,200,newUser,"User created successfully")
    } catch (error) {
        console.log("Error while creating user",JSON.stringify(error));
        return sendResponse(res,500,null,"Failed to create user,Please try again later")
    }
};


