import { RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../middleware/authentication";
import { ScopeOfWork } from "../models/ScopeofWork";
import { sendResponse } from "../utils/response";
import { paginate } from "../utils/paginate";
import { Op } from "sequelize";
import { Units } from "../models/Units";

export const getScopeOfWork: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;
        const sortBy = req.query.sortBy ? req.query.sortBy.toString() : "createdTime"; // Default sort by createdTime
        const sortOrder = req.query.sortOrder && req.query.sortOrder.toString().toLowerCase() === "asc" ? "ASC" : "DESC"; // Default sortOrder is DESC

        // Step 1: Get matching unit IDs if searching by unitName
        let unitIds: number[] = [];
        let unitMap: Record<number, string> = {}; // Map of unitId to unitName

        if (search) {
            const units = await Units.findAll({
                where: { unit: { [Op.like]: `%${search}%` } },
                attributes: ['id', 'unit']
            });
            unitIds = units.map((unit: any) => unit.id);
            unitMap = units.reduce((acc, unit: any) => {
                acc[unit.id] = unit.unit;
                return acc;
            }, {} as Record<number, string>);
        }

        // Step 2: Create search condition
        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["type", "serviceItemName", "rate", "isAddon"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        ...(unitIds.length > 0 ? [{ unit: { [Op.in]: unitIds } }] : []) // Search by unit ID if unitName matches
                    ]
                }
            ];
        }

        // Step 3: Fetch ScopeOfWork data with sorting
        const paginationOptions: any = {
            where: whereCondition,
            order: [[sortBy, sortOrder]] // Sorting dynamically
        };

        let items;
        let pagination;

        if (!page || !pageSize) {
            items = await ScopeOfWork.findAll(paginationOptions);
            pagination = null;
        } else {
            const result = await paginate(ScopeOfWork, page, pageSize, paginationOptions);
            items = result.data;
            pagination = result.pagination;
        }

        // Step 4: Attach unitName dynamically
        items = items.map(item => ({
            ...item.toJSON(),
            unitName: unitMap[item.unit] || null
        }));

        console.log("🚀 ~ scopeOfWork:", items?.length);
        return sendResponse(res, 201, { items, pagination }, "Scope of work found");
    } catch (error) {
        console.log("Error while fetching scope of work", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the scope of work");
    }
};
