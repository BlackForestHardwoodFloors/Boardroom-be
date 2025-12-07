import { Op } from "sequelize";
import { Jobs } from "../models/Jobs";
import { Employee } from "../models/Employee";
import { GeneralTasks } from "../models/GeneralTask";
import moment from "moment";
import { Contact } from "../models/Contact";
import { VendorCompany } from "../models/VendorCompany";
import { ScopeOfWork } from "../models/ScopeofWork";
import { RolePermission } from "../models/RolePermission";
import { Department } from "../models/Departments";

export type FilterBy = 'daily' | 'weekly' | 'monthly';

export const getEmployeeMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const employees = await Employee.findAll({
        where: {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
            ],
        },
        attributes: ['id', 'firstName', 'lastName'],
    });

    const ids = employees.map((e: any) => e.id);
    const map = employees.reduce((acc, emp: any) => {
        acc[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getContactMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const contacts = await Contact.findAll({
        where: {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
            ],
        },
        attributes: ['id', 'firstName', 'lastName'],
    });

    const ids = contacts.map((e: any) => e.id);
    const map = contacts.reduce((acc, emp: any) => {
        acc[emp.id] = `${emp.firstName} ${emp.lastName}`;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getJobMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const jobs = await Jobs.findAll({
        where: {
            jobName: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'jobName'],
    });

    const ids = jobs.map((j: any) => j.id);
    const map = jobs.reduce((acc, job: any) => {
        acc[job.id] = job.jobName;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getTaskMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const tasks = await GeneralTasks.findAll({
        where: {
            taskName: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'taskName'],
    });

    const ids = tasks.map((t: any) => t.id);
    const map = tasks.reduce((acc, task: any) => {
        acc[task.id] = task.taskName;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getDateRange = (filterBy: FilterBy): [string, string] => {
    const today = moment();
    switch (filterBy) {
        case 'daily':
            return [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')];
        case 'weekly':
            return [
                today.clone().startOf('week').add(1, 'day').format('YYYY-MM-DD'),
                today.clone().endOf('week').add(1, 'day').format('YYYY-MM-DD'),
            ];
        case 'monthly':
            return [
                today.clone().startOf('month').format('YYYY-MM-DD'),
                today.clone().endOf('month').format('YYYY-MM-DD'),
            ];
        default:
            return ['', ''];
    }
};

export const getVendorCompanyMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const comapnies = await VendorCompany.findAll({
        where: {
            companyName: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'companyName'],
    });

    const ids = comapnies.map((t: any) => t.id);
    const map = comapnies.reduce((acc, company: any) => {
        acc[company.id] = company.companyName;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getBrandMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const items = await ScopeOfWork.findAll({
        where: {
            serviceItemName: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'serviceItemName'],
    });

    const ids = items.map((t: any) => t.id);
    const map = items.reduce((acc, item: any) => {
        acc[item.id] = item.serviceItemName;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getRoleMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const roles = await RolePermission.findAll({
        where: {
            role: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'role'],
    });

    const ids = roles.map((t: any) => t.id);
    const map = roles.reduce((acc, item: any) => {
        acc[item.id] = item.role;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getDepartmentMap = async (search: string): Promise<[Record<number, string>, number[]]> => {
    const departments = await Department.findAll({
        where: {
            departmentName: { [Op.like]: `%${search}%` },
        },
        attributes: ['id', 'departmentName'],
    });

    const ids = departments.map((t: any) => t.id);
    const map = departments.reduce((acc, item: any) => {
        acc[item.id] = item.departmentName;
        return acc;
    }, {} as Record<number, string>);

    return [map, ids];
};

export const getErrorMessage = (error: any): string => {
    if (error.__type?.includes('ConflictException')) {
        if (error.Reason === 'DESTINATION_PHONE_NUMBER_NOT_VERIFIED') {
            return 'This phone number needs to be verified first. Please verify the phone number in AWS Console.';
        }
    }

    if (error.Fields?.length > 0) {
        switch(error.Fields[0].Message) {
            case 'MEMBER_IS_INVALID':
                return 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)';
            default:
                return `Invalid parameter: ${error.Fields[0].Name}`;
        }
    }
    
    switch(error.Reason) {
        case 'INVALID_PARAMETER':
            return 'One or more parameters are invalid';
        case 'THROTTLING_EXCEPTION':
            return 'Too many requests. Please try again later';
        case 'UNAUTHORIZED':
            return 'Not authorized to send messages';
        case 'DESTINATION_PHONE_NUMBER_NOT_VERIFIED':
            return 'This phone number needs to be verified first. Please verify the phone number in AWS Console.';
        default:
            return error.message || 'Failed to send SMS. Please try again';
    }
};