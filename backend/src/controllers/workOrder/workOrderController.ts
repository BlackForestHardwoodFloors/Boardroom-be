import { RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { WorkOrder } from "../../models/workOrder/workOrder";
import { paginate } from "../../utils/paginate";
import { sendResponse } from "../../utils/response";
import { Contract } from "../../models/Contract";
import { validateFields } from "../../utils/validateFields";
import { Op, Sequelize } from "sequelize";

export const getWorkOrder: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;
        const contact = req.query.contact ? parseInt(req.query.contact as string) : null;

        const whereCondition: any = {
            [Op.and]: [
                {
                    [Op.or]: [
                        { delete: { [Op.ne]: "Yes" } },
                        { delete: { [Op.is]: null } }
                    ]
                }
            ]
        };

        if (search) {
            whereCondition[Op.and].push({
                [Op.or]: [
                    Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(Contract.personalInformation, '$.jobName')) LIKE '%${search}%'`),
                    Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(Contract.personalInformation, '$.phone')) LIKE '%${search}%'`),
                    Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(Contract.personalInformation, '$.email')) LIKE '%${search}%'`),
                    Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(Contract.personalInformation, '$.proposalSubmittedTo')) LIKE '%${search}%'`),
                    Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(Contract.personalInformation, '$.location')) LIKE '%${search}%'`)
                ]
            });
        }

        if (contact) {
            whereCondition[Op.and].push(
                Sequelize.literal(`JSON_EXTRACT(Contract.personalInformation, '$.contactId') = '${contact}'`)
            );
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Contract,
                    required: false,
                }
            ],
            order: [['createdTime', 'DESC']],
        };
        // Apply pagination
        const result = await paginate(WorkOrder, page, pageSize, paginationOptions);
        const workOrders = result.data;
        const pagination = result.pagination;

        return sendResponse(res, 200, { workOrders, pagination }, "Work Orders found");
    } catch (error) {
        console.error("Error fetching work Orders:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Work Orders");
    }
};

export const getSingleWorkOrder: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const workOrder = await WorkOrder.findByPk(id, {
            include: [{ model: Contract }]
        })

        if (!workOrder) {
            return sendResponse(res, 404, null, "Work Order not found");
        }

        return sendResponse(res, 200, workOrder, "Work Orders found");
    } catch (error) {
        console.error("Error fetching work Orders:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Work Orders");
    }
};

export const updateWorkOrder: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            contractId,
            jobForeman,
            supportTeam,
            placeYardSign,
            estimatedJobHours,
            scheduled,
            notes,
            finishType,
            finishSheen,
            stained,
            stain,
            hourlyRate,
            workDescription,
            moistureReadings,
            installation,
            sanding,
            finishing,
            dustControl,
            generalJobCleanup,
            tools,
            materials,
        } = req.body;

        const requiredFields = ['contractId'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // Find existing workOrder
        const existingWorkOrder = await WorkOrder.findOne({ where: { id } });
        if (!existingWorkOrder) {
            return sendResponse(res, 404, null, "Work Order not found");
        }

        const updatedWorkOrder = await WorkOrder.update(
            {
                contractId,
                jobForeman,
                supportTeam,
                placeYardSign,
                estimatedJobHours,
                scheduled,
                notes,
                finishType,
                finishSheen,
                stained,
                stain,
                hourlyRate,
                workDescription,
                moistureReadings,
                installation,
                sanding,
                finishing,
                dustControl,
                generalJobCleanup,
                tools,
                materials,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            },
            {
                where: { id },
            }
        );

        return sendResponse(res, 200, updatedWorkOrder, "work order updated successfully");
    } catch (error) {
        console.log("Error while updating work order", error);
        return sendResponse(res, 500, null, "An error occurred while updating the work order");
    }
}