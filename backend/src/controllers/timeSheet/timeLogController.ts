import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { paginate } from '../../utils/paginate';
import { TimeLogs } from '../../models/timeSheet/TimeLogs';
import { Jobs } from '../../models/Jobs';
import { Op, Sequelize } from 'sequelize';
import { GeneralTasks } from '../../models/GeneralTask';
import { Employee } from '../../models/Employee';
import moment from 'moment';
import { FilterBy, getDateRange, getEmployeeMap, getJobMap, getTaskMap } from '../../utils/helper';

interface TimeLogsRequestBody {
    id: string;
    logType: string;
    dateOfWork: string;
    jobName: string;
    taskName: string;
    typeOfWork: string;
    startTime: string;
    endTime: string;
    breakTime: string;
    employee: string;
    totalHours: string;
    note: string;
    approval: string;
    images: string[];
}

export const createOrUpdateTimeLogs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            logType,
            jobName,
            taskName,
            typeOfWork,
            startTime,
            endTime,
            breakTime,
            employee,
            totalHours,
            note,
            approval,
            images,
            dateOfWork
        }: TimeLogsRequestBody = req.body;

        const requiredFields = ['logType', 'typeOfWork', 'startTime', 'endTime', 'employee'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // If an ID is provided, perform the update
        if (id) {
            const updatedTimeLogs = await TimeLogs.update({
                logType,
                jobName,
                taskName,
                typeOfWork,
                startTime,
                endTime,
                breakTime,
                employee,
                approval: approval || "Pending",
                totalHours,
                note,
                images,
                dateOfWork: dateOfWork,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date()
            }, {
                where: { id: id }
            });

            if (updatedTimeLogs[0] === 0) {
                return sendResponse(res, 404, null, "TimeLogs not found");
            }

            return sendResponse(res, 200, updatedTimeLogs, "TimeLogs updated successfully");
        }

        // If no ID is provided, perform the create operation
        const newTimeLogs = await TimeLogs.create({
            logType,
            jobName,
            taskName,
            typeOfWork,
            startTime,
            endTime,
            breakTime,
            employee,
            totalHours,
            note,
            dateOfWork: dateOfWork,
            approval: approval || "Pending",
            images,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });

        return sendResponse(res, 201, newTimeLogs, "TimeLogs created successfully");
    } catch (error) {
        console.log("Error while upserting TimeLogs", error);
        return sendResponse(res, 500, null, "An error occurred while upserting the TimeLogs");
    }
};

export const getTimeLogs: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const fetchAll = req.query.fetchAll === 'true';
        const employeeId = req.query.employee as string;
        const search = req.query.search?.toString() || null;
        const filterBy = req.query.filterBy as FilterBy | undefined;
        const month = req.query.month ? parseInt(req.query.month as string) : null;
        const days = req.query.days ? parseInt(req.query.days as string) : null;
        const contact = req.query.contact ? parseInt(req.query.contact as string) : null;

        const [employeeMap, employeeIds] = search ? await getEmployeeMap(search) : [{}, []];
        const [jobMap, jobIds] = search ? await getJobMap(search) : [{}, []];
        const [taskMap, taskIds] = search ? await getTaskMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: 'Yes' } },
                { delete: { [Op.is]: null } }
            ],
        };

        // Filter by contact: fetch all jobs with this contact and filter by jobName
        if (contact) {
            const jobs:any = await Jobs.findAll({
                where: {
                    jobName: String(contact),
                },
                attributes: ['id'],
            });
            const contactJobNames = jobs.map(job => job.id);
            if (contactJobNames.length > 0) {
                whereCondition.jobName = { [Op.in]: contactJobNames };
            } else {
                return sendResponse(res, 200, { timeLogs: [], pagination: null }, 'No TimeLogs found for the given contact');
            }
        }

        // Employee filter
        if (employeeId && employeeId !== 'All') {
            whereCondition.employee = {
                [Op.in]: employeeId.split(',').map(Number).filter(id => !isNaN(id)),
            };
        }

        // Search filter
        if (search) {
            const searchableFields = ['logType', 'totalHours', 'breakTime'];

            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` },
                        })),
                        ...(employeeIds.length ? [{ employee: { [Op.in]: employeeIds } }] : []),
                        ...(taskIds.length ? [{ taskName: { [Op.in]: taskIds } }] : []),
                        ...(jobIds.length ? [{ jobName: { [Op.in]: jobIds } }] : []),
                    ],
                },
            ];
        }

        // Filter by day/week/month
        if (filterBy) {
            const [startDate, endDate] = getDateRange(filterBy);
            whereCondition[Op.and] = whereCondition[Op.and] || [];
            whereCondition[Op.and].push({
                dateOfWork: { [Op.between]: [startDate, endDate] },
            });
        }

        if (days && !isNaN(days)) {
            const endDate = moment().endOf('day').toDate();
            const startDate = moment().subtract(days, 'days').startOf('day').toDate();

            whereCondition[Op.and] = whereCondition[Op.and] || [];
            whereCondition[Op.and].push({
                dateOfWork: { [Op.between]: [startDate, endDate] },
            });
        }

        // Filter by month
        if (month && month !== Number('All')) {
            whereCondition[Op.and] = whereCondition[Op.and] || [];
            whereCondition[Op.and].push(
                Sequelize.where(
                    Sequelize.fn('MONTH', Sequelize.col('createdTime')),
                    month
                )
            );
        }

        const paginationOptions: any = {
            where: whereCondition,
            order: [['createdTime', 'DESC']],
        };

        let timeLogs;
        let pagination;

        if (fetchAll) {
            timeLogs = await TimeLogs.findAll(paginationOptions);
        } else {
            const result = await paginate(TimeLogs, page, pageSize, paginationOptions);
            timeLogs = result.data;
            pagination = result.pagination;
        }

        const finalLogs = timeLogs.map((item: any) => ({
            ...item.toJSON(),
            employeeName: employeeMap[item.employee] || null,
            job: jobMap[item.jobName] || null,
            task: taskMap[item.taskName] || null,
        }));

        return sendResponse(res, 200, { timeLogs: finalLogs, pagination }, 'TimeLogs found');
    } catch (error) {
        console.error('Error while fetching TimeLogs:', error);
        return sendResponse(res, 500, null, 'An error occurred while fetching the TimeLogs');
    }
};


export const deleteTimeLogs: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await TimeLogs.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "TimeLogs deleted successfully");
    } catch (error) {
        console.log("Error while deleting TimeLogs", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the TimeLogs");
    }
}

export const getBookedSlots = async (req: Request, res: Response): Promise<any> => {
    try {
        const { employee, dateOfWork } = req.query;

        if (!employee || !dateOfWork) {
            return sendResponse(res, 400, null, "Missing required parameters: employee or dateOfWork");
        }

        const logs = await TimeLogs.findAll({
            where: {
                employee,
                dateOfWork: {
                    [Op.eq]: moment(dateOfWork as string).format("YYYY-MM-DD"),
                },
            },
            order: [['endTime', 'DESC']],
        });

        const startTimeExcluded: string[] = [];
        const endTimeExcluded: string[] = [];

        logs.forEach(log => {
            const { startTime, endTime } = log.get();

            const start = moment(startTime, "HH:mm:ss");
            const end = moment(endTime, "HH:mm:ss");

            let currentStart = moment(start);
            while (currentStart.isBefore(end)) {
                startTimeExcluded.push(currentStart.format("HH:mm"));
                currentStart.add(15, "minutes");
            }

            let currentEnd = moment(end);
            while (currentEnd.isAfter(start)) {
                endTimeExcluded.push(currentEnd.format("HH:mm"));
                currentEnd.subtract(15, "minutes");
            }
        });

        return sendResponse(res, 200, { startTimeExcluded, endTimeExcluded }, "Excluded time slots fetched successfully");

    } catch (error) {
        console.error("Error fetching time slots:", error);
        return sendResponse(res, 500, null, "An error occurred while fetching time slots");
    }
};
