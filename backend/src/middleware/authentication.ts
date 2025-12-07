import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserAttributes } from "../models/User";
import { Employee } from "../models/Employee";
import NodeCache from "node-cache";

export const userDataCache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 60, useClones: false}); 

// Initialize dotenv
dotenv.config();

export interface IGetUserAuthInfoRequest extends Request {
  user: UserAttributes 
}

export const authenticateToken = async (
  req: IGetUserAuthInfoRequest, 
  res: Response, 
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = req.headers["refresh-token"];
    const token = authHeader && authHeader.split(" ")[1];

    // If neither token is found, return 401
    if (!token && !refreshToken) {
      return res.status(401).json({ message: "Token not found" });
    }

    // Verify the token using JWT
    jwt.verify(token!, process.env.JWT_SECRET as string, async (err, user:UserAttributes) => {
      if (err) {
        // If there's an error in verification, session might have timed out
        return res.status(401).json({ message: "Your session has timed out. Please login again." });
      } else {
        // Attach the user object to the request
        let userData: any = null;
        const cachedUserData = userDataCache.get(user.id);
        if (cachedUserData) {
          userData = cachedUserData;
        }
        else {
          userData = await Employee.findOne({
            where: { id: user.id },
            attributes: ['id', 'rolesPermissions', 'portalStatus'],
            raw: true
          });

          if (userData) {
            userDataCache.set(user.id, userData);
          }
        }
        if (!userData) {
          return res.status(404).json({ message: "User not found" })
        }
        if (userData.portalStatus === "Deactivated") {
          return res.status(401).json({ message: "Account is inactive" });
        }
        req.user = user;
        next(); // Proceed to the next middleware or route handler
      }
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error in authenticateToken middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
