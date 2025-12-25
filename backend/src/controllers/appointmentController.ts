import { Request, RequestHandler, Response } from 'express';
import { Sequelize, Op } from 'sequelize';
import { Appointment } from '../models/Appointment';
import { sendResponse } from '../utils/response';
import moment from 'moment';
import { Employee } from '../models/Employee';
import { validateFields } from '../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../middleware/authentication';
import { paginate } from '../utils/paginate';
import { Contact } from '../models/Contact';
import { getContactMap, getEmployeeMap } from '../utils/helper';
const formatDateOnly = (date) => date.toISOString().split('T')[0];

interface AppointmentRequestBody {
    id: string;
    purpose: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    contact: string;
    location: string;
    employeeName: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    foreman: string;
}

export const createAppointment: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            id,
            purpose,
            description,
            startDate,
            startTime,
            endDate,
            endTime,
            contact,
            location,
            firstName,
            lastName,
            employeeName,
            foreman,
        }: AppointmentRequestBody = req.body;

        const requiredFields = ['startDate', 'startTime', 'endDate', 'endTime', 'purpose'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);

        if (startDateTime >= endDateTime) {
            return sendResponse(res, 400, null, "Start time must be earlier than end time");
        }

        // const hasConflict = await checkAppointmentConflict(userId, startDate, startTime, endDate, endTime);

        // if (hasConflict) {
        //     sendResponse(res, 400, null, "Meeting time conflicts with an existing meeting");
        // }

        const newAppointment = await Appointment.create({
            id,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            purpose,
            description,
            contact,
            location,
            employeeName,
            firstName,
            lastName,
            foreman,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newAppointment, "Appointment created successfully");
    } catch (error) {
        console.log("Error while creating appointment", error);
        return sendResponse(res, 500, null, "An error occurred while creating the appointment");
    }
};

export const getAppointment: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const employeeId = req.query.employee;

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const contact = req.query.contact ? parseInt(req.query.contact as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;
        const age = req.query.age ? req.query.age.toString() : null;
        const purpose = req.query.purpose ? req.query.purpose.toString() : null;

        const [employeeMap, employeeIds] = search ? await getEmployeeMap(search) : [{}, []];
        const [contactMap, contactIds] = search ? await getContactMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ],
            ...(employeeId ? { employeeName: employeeId } : {}),
            ...(contact ? { contact } : {})
        };
        
        if (age) {
            if (age === 'today') {
                const today = new Date();
                const formatted = formatDateOnly(today);

                whereCondition['startDate'] = {
                    [Op.eq]: formatted
                };
            }

            if (age === 'thisWeek') {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                const today = new Date();

                whereCondition['startDate'] = {
                    [Op.between]: [formatDateOnly(sevenDaysAgo), formatDateOnly(today)]
                };
            }
            if (age === 'lastWeek') {
                const start = new Date();
                start.setDate(start.getDate() - 7);
                start.setHours(0, 0, 0, 0);

                const end = new Date();
                end.setDate(end.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                whereCondition['startDate'] = {
                    [Op.between]: [formatDateOnly(start), formatDateOnly(end)]
                };
            }
        }
        if (purpose) {
            whereCondition['purpose'] = purpose;
        }
        if (search) {
            const searchableFields = ["purpose"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        ...(contactIds.length > 0 ? [{ contact: { [Op.in]: contactIds } }] : []),
                        ...(employeeIds.length > 0 ? [{ employeeName: { [Op.in]: employeeIds } }] : [])
                    ],
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: {
                model: Employee,
                where: {
                    id: Sequelize.col('Appointment.employeeName')
                },
                required: false
            },
            order: [['createdTime', 'DESC']],
        };

        let appointments;
        let pagination;

        if (!page || !pageSize) {
            appointments = await Appointment.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Appointment, page, pageSize, paginationOptions);
            appointments = result.data;
            pagination = result.pagination;
        }

        appointments = appointments.map(item => ({
            ...item.toJSON(),
            contactName: contactMap[item.contact] || null,
            employee: employeeMap[item.employeeName] || null
        }));

        console.log("appointments", appointments?.length);

        return sendResponse(res, 200, { appointments, pagination }, "Appointments found");
    } catch (error) {
        console.log("Error while fetching appointment", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the appointment");
    }
};

const checkAppointmentConflict = async (
    userId: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
): Promise<boolean> => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const conflict = await Appointment.findOne({
        where: {
            userId,
            [Op.or]: [
                {
                    [Op.and]: [
                        Sequelize.literal(
                            `'${startDateTime.toISOString()}' BETWEEN CONCAT(startDate, 'T', startTime) AND CONCAT(endDate, 'T', endTime)`
                        ),
                    ],
                },
                {
                    [Op.and]: [
                        Sequelize.literal(
                            `'${endDateTime.toISOString()}' BETWEEN CONCAT(startDate, 'T', startTime) AND CONCAT(endDate, 'T', endTime)`
                        ),
                    ],
                },
                {
                    [Op.and]: [
                        Sequelize.literal(
                            `CONCAT(startDate, 'T', startTime) BETWEEN '${startDateTime.toISOString()}' AND '${endDateTime.toISOString()}'`
                        ),
                    ],
                },
                {
                    [Op.and]: [
                        Sequelize.literal(
                            `CONCAT(endDate, 'T', endTime) BETWEEN '${startDateTime.toISOString()}' AND '${endDateTime.toISOString()}'`
                        ),
                    ],
                },
            ],
        },
    });

    console.log("Conflict found:", conflict);

    return !!conflict;
};

export const updateAppointment: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const appointmentId = req.params.id;
        const {
            id,
            startDate,
            startTime,
            endDate,
            endTime,
            purpose,
            description,
            contact,
            location,
            employeeName,
            firstName,
            lastName,
            foreman,
        }: AppointmentRequestBody = req.body;

        const requiredFields = ['startDate', 'startTime', 'endDate', 'endTime', 'purpose'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updatedAppointment = await Appointment.update(
            {
                id,
                startDate: startDate,
                startTime: startTime,
                endDate: endDate,
                endTime: endTime,
                purpose,
                description,
                contact,
                location,
                employeeName,
                firstName,
                lastName,
                foreman,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            },
            {
                where: { id: appointmentId },
            }
        );
        return sendResponse(res, 201, updatedAppointment, "Appointment updated successfully");
    } catch (error) {
        console.log("Error while updating appointment", error);
        return sendResponse(res, 500, null, "An error occurred while updating the appointment");
    }
}

export const deleteAppointment: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const appointmentId = req.params.id;
        await Appointment.update(
            { delete: "Yes" },
            { where: { id: appointmentId } }
        );
        return sendResponse(res, 201, null, "Appointment marked as deleted successfully");
    } catch (error) {
        console.log("Error while marking appointment as deleted", error);
        return sendResponse(res, 500, null, "An error occurred while updating the appointment");
    }
};
