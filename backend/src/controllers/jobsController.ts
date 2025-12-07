import { RequestHandler, Response } from "express";
import { IGetUserAuthInfoRequest } from "../middleware/authentication";
import { sendResponse } from "../utils/response";
import { paginate } from "../utils/paginate";
import { Jobs } from "../models/Jobs";
import { validateFields } from "../utils/validateFields";
import { Op, Sequelize } from "sequelize";
import { JobsLog } from "../models/JobsLog";
import { Appointment } from "../models/Appointment";
import moment from "moment";

interface jobsRequestBody {
    id: string;
    contractId: number;
    jobName: string;
    jobAddress: string;
    status: string;
    estimatedHours:string;
    contractValue: string;
    startDate: string;
    completedDate: string;
    assignedEmployee: string[]
    foreman: string
    note: string;
    contact: string;
    images: string[];
    startTime: string;
    endTime: string;
}

export const createJobs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            jobName,
            jobAddress,
            status,
            contractValue,
            estimatedHours,
            startDate,
            completedDate,
            startTime,
            endTime,
            assignedEmployee,
            foreman,
            note,
            contact,
            images
        }: jobsRequestBody = req.body;

        const requiredFields = ['jobName', 'jobAddress', 'status', 'startDate'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newjobs: any = await Jobs.create({
            jobName,
            jobAddress,
            status,
            contractValue,
            estimatedHours,
            startDate,
            completedDate,
            assignedEmployee,
            foreman,
            notes:note,
            contact,
            images,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        await JobsLog.create({
            jobId: newjobs.id,
            action: `New project "${newjobs.contact}" created`,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdAt: new Date()
        });

        await Appointment.create({
            startDate,
            startTime,
            endDate: completedDate,
            endTime,
            purpose: 'Project',
            contact: jobName,
            location: jobAddress,
            employeeName: 16,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });

        return sendResponse(res, 201, newjobs, "jobs created successfully");
    } catch (error) {
        console.log("Error while upserting jobs", error);
        return sendResponse(res, 500, null, "An error occurred while upserting the jobs");
    }
};

export const getJobs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const fetchAll = req.query.fetchAll === 'true';
        const employeeId = req.query.employee;
        const status = req.query.status as string;
        const search = req.query.search ? req.query.search.toString() : null;
        const contact = req.query.contact ? parseInt(req.query.contact as string) : null;

        // Ensure a valid where condition
        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ],
            ...(status ? { status: status } : {}),
            ...(contact ? { jobName: contact } : {}),
            ...(employeeId ? { assignedEmployee: Sequelize.literal(`JSON_CONTAINS(assignedEmployee, '"${employeeId}"')`) } : {})
        };

        if (search) {
            const searchableFields = ["jobName", "jobAddress", "status"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                    ]
                }
            ];
        }

        if (req.query.unassigned === 'true') {
            whereCondition[Op.and] = whereCondition[Op.and] || [];
            whereCondition[Op.and].push(
                Sequelize.literal(`(assignedEmployee IS NULL OR JSON_LENGTH(assignedEmployee) = 0 OR JSON_CONTAINS(assignedEmployee, '"notAssigned"'))`)
            );
        } else if (req.query.unassigned === 'false') {
            whereCondition[Op.and] = whereCondition[Op.and] || [];
            whereCondition[Op.and].push(
                Sequelize.literal(`(assignedEmployee IS NOT NULL AND JSON_LENGTH(assignedEmployee) > 0 AND NOT JSON_CONTAINS(assignedEmployee, '"notAssigned"'))`)
            );
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let jobs;
        let pagination;

        if (fetchAll) {
            jobs = await Jobs.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Jobs, page, pageSize, paginationOptions);
            jobs = result.data;
            pagination = result.pagination;
        }

        return sendResponse(res, 200, { jobs, pagination }, "Jobs found");
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Jobs");
    }
};

export const updateJobs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            jobName,
            jobAddress,
            status,
            contractValue,
            estimatedHours,
            startDate,
            completedDate,
            assignedEmployee,
            foreman,
            note,
            contact,
            images
        }: Partial<jobsRequestBody> = req.body;

        const existingJob: any = await Jobs.findOne({ where: { id } });
        if (!existingJob) {
            return sendResponse(res, 404, null, "Job not found");
        }

        const updatedFields: any = {
            modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
            modifiedTime: new Date()
        };

        // Dynamically add only provided fields to the update payload
        if (jobName !== undefined) updatedFields.jobName = jobName;
        if (jobAddress !== undefined) updatedFields.jobAddress = jobAddress;
        if (status !== undefined) updatedFields.status = status;
        if (contractValue !== undefined) updatedFields.contractValue = contractValue;
        if (estimatedHours !== undefined ) updatedFields.estimatedHours = estimatedHours;
        if (startDate !== undefined) updatedFields.startDate = startDate;
        if (completedDate !== undefined) updatedFields.completedDate = completedDate;
        if (assignedEmployee !== undefined) updatedFields.assignedEmployee = assignedEmployee;
        if (foreman !== undefined) updatedFields.foreman = foreman
        if (note !== undefined) updatedFields.notes = note;
        if (contact !== undefined) updatedFields.contact = contact;
        if (images !== undefined) updatedFields.images = images;

        const previousStatus = existingJob.status;

        await Jobs.update(updatedFields, { where: { id } });

        if (status && previousStatus !== status) {
            await JobsLog.create({
                jobId: id,
                action: `"${existingJob.contact}" marked as ${status.toLowerCase()}`,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdAt: new Date()
            });
        }


        return sendResponse(res, 200, updatedFields, "Job updated successfully");
    } catch (error) {
        console.error("Error while updating job", error);
        return sendResponse(res, 500, null, "An error occurred while updating the job");
    }
};


export const deleteJob: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        await Jobs.update(
            { delete: "Yes" },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Job marked as deleted successfully");
    } catch (error) {
        console.log("Error while marking job as deleted", error);
        return sendResponse(res, 500, null, "An error occurred while updating the job");
    }
};


export const getJobLogs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const logs = await JobsLog.findAll({
            order: [['createdTime', 'DESC']]
        });

        return sendResponse(res, 200, logs, "Job logs fetched successfully");
    } catch (error) {
        console.error("Error fetching job logs:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching job logs");
    }
};