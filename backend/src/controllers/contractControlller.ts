import { RequestHandler, Response } from 'express';

import { sendResponse } from "../utils/response";
import { Contract } from '../models/Contract';
import { validateFields } from '../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../middleware/authentication';
import { paginate } from '../utils/paginate';
import { Jobs } from '../models/Jobs';
import { Op, Sequelize } from 'sequelize';
import { Appointment } from '../models/Appointment';
import { WorkOrder } from '../models/workOrder/workOrder';
import { getSignedContractEmailTemplate } from '../utils/emailTemplate';
import { sendEmailUtil } from './emailController';
import { Quote } from '../models/Quote';
import { Contact } from '../models/Contact';

export const createContract: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            quoteId,
            installations,
            finishing,
            addOn,
            customStain,
            additionalWork,
            authorizedSignature,
            ownerOrOccupantSignature,
            dateOfContract,
            contractStatus,
            personalInformation,
            phases,
            woodDeliveryDate,
            startDate,
            completedDate
        } = req.body;


        const requiredFields = ['quoteId'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newContract = await Contract.create({
            quoteId,
            installations,
            finishing,
            addOn,
            customStain,
            additionalWork,
            authorizedSignature,
            ownerOrOccupantSignature,
            dateOfContract,
            contractStatus,
            woodDeliveryDate,
            startDate,
            completedDate,
            personalInformation: personalInformation,
            phases,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdByEmail: req.user.email,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newContract, "Contract created successfully");
    } catch (error) {
        console.log("Error while creating contract", error);
        return sendResponse(res, 500, null, "An error occurred while creating the contract");
    }
}

export const updateContract: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            quoteId,
            installations,
            finishing,
            addOn,
            customStain,
            additionalWork,
            authorizedSignature,
            ownerOrOccupantSignature,
            dateOfContract,
            contractStatus,
            personalInformation,
            phases,
            startTime,
            endTime,
            woodStartTime,
            woodEndTime,
            woodDeliveryDate,
            startDate,
            completedDate
        } = req.body;

        const requiredFields = ['quoteId'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // Find existing contract
        const existingContract = await Contract.findOne({ where: { id } });
        if (!existingContract) {
            return sendResponse(res, 404, null, "Contract not found");
        }

        const updatedContract: any = await Contract.update(
            {
                quoteId,
                installations,
                finishing,
                addOn,
                customStain,
                additionalWork,
                authorizedSignature,
                ownerOrOccupantSignature,
                dateOfContract,
                contractStatus,
                personalInformation,
                phases,
                startTime,
                endTime,
                startDate,
                completedDate,
                woodDeliveryDate,
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            },
            {
                where: { id },
            }
        );

        // If contractStatus is updated to 'Signed', create a ReadyToStart entry
        const existingJobs: any = await Jobs.findOne({ where: { contractId: id } });
        if (contractStatus === 'Signed') {
            let jobName = '';

            if (personalInformation?.clientSource === 'Contractor') {
                const companyName = personalInformation?.companyName || '';
                if (personalInformation?.clientDetailsAvailability === 'Yes') {
                    // Client name is available → include company and client last name
                    const clientLastName = personalInformation?.clientLastName || '';
                    jobName = `${companyName} - ${clientLastName}`.trim();
                } else {
                    jobName = companyName.trim();
                }
            } else if (personalInformation?.clientSource === 'Direct') {
                const lastName = personalInformation?.clientLastName || '';
                const firstName = personalInformation?.clientFirstName || '';
                jobName = `${lastName} ${firstName}`.trim();
            }

            if (!existingJobs) {
                await Jobs.create({
                    contractId: id,
                    // jobName: personalInformation?.jobName,
                    jobName,
                    contact: personalInformation?.proposalSubmittedTo,
                    jobAddress: personalInformation?.location,
                    assignedEmployee: JSON.stringify(["notAssigned"]),
                    startDate,
                    completedDate,
                    createdBy: req.user.firstName + " " + req.user.lastName,
                    createdTime: new Date().toISOString(),
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date().toISOString()
                });
            } else {
                await Jobs.update(
                    {
                        contractId: id,
                        // jobName: personalInformation?.jobName,
                        jobName,
                        contact: personalInformation?.proposalSubmittedTo,
                        jobAddress: personalInformation?.location,
                        assignedEmployee: existingJobs?.assignedEmployee ? existingJobs?.assignedEmployee : JSON.stringify(["notAssigned"]),
                        startDate: dateOfContract,
                        modifiedBy: req.user.firstName + " " + req.user.lastName,
                        modifiedTime: new Date().toISOString()
                    },
                    { where: { id: existingJobs?.id } }
                );
            }

            await Appointment.create({
                startDate,
                startTime,
                endDate: completedDate,
                endTime,
                purpose: 'Project',
                contact: personalInformation?.contactId,
                location: personalInformation?.location,
                employeeName: 16,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            });
            await Appointment.create({
                startDate: woodDeliveryDate,
                startTime: woodStartTime,
                endDate: woodDeliveryDate,
                endTime: woodEndTime,
                purpose: 'Wood Delivery',
                contact: personalInformation?.contactId,
                location: personalInformation?.location,
                employeeName: 16,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            });

            const existingWorkOrder: any = await WorkOrder.findOne({ where: { contractId: id } });
            if (!existingWorkOrder) {
                await WorkOrder.create({
                    contractId: id,
                    createdBy: req.user.firstName + " " + req.user.lastName,
                    createdTime: new Date().toISOString(),
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date().toISOString()
                });
            } else {
                await WorkOrder.update(
                    {
                        contractId: id,
                        modifiedBy: req.user.firstName + " " + req.user.lastName,
                        modifiedTime: new Date().toISOString()
                    },
                    { where: { id: existingWorkOrder?.id } }
                );
            }

            const quoteData: any = await Quote.findByPk(quoteId, {
                attributes: ['id', 'createdByEmail'],
            })

            const contractId = id
            const hostname = req.get('host')
            const isLocalhost = hostname.includes('localhost');

            const token = req.headers['authorization']?.split(' ')[1];
            const encodeContractId = btoa(contractId);
            const encodedType = btoa('email');
            const encodedToken = btoa(token);

            const contractLink = isLocalhost ? `http://localhost:3000/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}` : `https://portal.blackforestfloors.com/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}`;

            const html = getSignedContractEmailTemplate({
                contractLink,
                logoUrl: "https://blackforest-assets.s3.us-east-1.amazonaws.com/blackforest_logo.png"
            })
            await sendEmailUtil({
                to: quoteData?.createdByEmail ? quoteData?.createdByEmail : isLocalhost ? 'Vanna@yopmail.com' : 'Osbornstevetheo@gmail.com',
                subject: 'Contract Signed – Project Can Begin',
                html: html
            });
        }

        return sendResponse(res, 200, updatedContract, "Contract updated successfully");
    } catch (error) {
        console.log("Error while updating contract", error);
        return sendResponse(res, 500, null, "An error occurred while updating the contract");
    }
};

export const getContract: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        if (id) {
            const result = await Contract.findOne({ where: { id } });

            if (!result) {
                return sendResponse(res, 404, null, "Contract not found");
            }

            const contract = result.toJSON();
            const contactId = contract.personalInformation?.contactId;
            if (contactId) {
                const contact = await Contact.findOne({
                    where: { id: contactId },
                    attributes: ["id", "firstName", "lastName"],
                });

                if (contact) {
                    const contactPlain = contact.get({ plain: true });

                    contract.personalInformation = {
                        ...contract.personalInformation,
                        firstName: contactPlain.firstName,
                        lastName: contactPlain.lastName
                    };
                }
            }

            return sendResponse(res, 200, contract, "Contract retrieved successfully");
        } else {

            const page = req.query.page ? parseInt(req.query.page as string) : null;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
            const fetchAll = req.query.fetchAll === 'true';
            const status = req.query.status as string;
            const search = req.query.search ? req.query.search.toString() : null;
            const contact = req.query.contact ? parseInt(req.query.contact as string) : null;

            const whereCondition: any = {
                [Op.or]: [
                    { delete: { [Op.ne]: "Yes" } },
                    { delete: { [Op.is]: null } }
                ],
                ...(status ? { contractStatus: status } : {}),
                ...(contact ? { ['personalInformation.contactId']: contact } : {})
            };

            if (search) {
                whereCondition[Op.or] = [
                    { contractStatus: { [Op.like]: `%${search}%` } },
                    Sequelize.where(
                        Sequelize.json("personalInformation.jobName"),
                        "LIKE",
                        `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.json("personalInformation.phone"),
                        "LIKE",
                        `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.json("personalInformation.email"),
                        "LIKE",
                        `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.json("personalInformation.proposalSubmittedTo"),
                        "LIKE",
                        `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.json("personalInformation.location"),
                        "LIKE",
                        `%${search}%`
                    ),
                    Sequelize.where(
                        Sequelize.json("personalInformation.jobPhone"),
                        "LIKE",
                        `%${search}%`
                    )
                ];
            }

            const paginationOptions: any = {
                where: whereCondition,
                order: [['createdTime', 'DESC']],
            };

            let contracts;
            let pagination;

            if (fetchAll) {
                contracts = await Contract.findAll(paginationOptions);
                pagination = null; // No pagination metadata if fetching all data
            } else {
                // Apply pagination
                const result = await paginate(Contract, page, pageSize, paginationOptions);
                contracts = result.data;
                pagination = result.pagination;
            }

            const contactIds = contracts
                .map((c: any) => c.personalInformation?.contactId)
                .filter((id: number) => !!id);

            const contacts = await Contact.findAll({
                where: { id: { [Op.in]: contactIds } },
                attributes: ["id", "firstName", "lastName", "email", "phone"],
            });

            const contactMap = contacts.reduce((acc: any, c: any) => {
                acc[c.id] = c;
                return acc;
            }, {});

            contracts = contracts.map((c: any) => {
                const plain = c.toJSON();
                const contactInfo = contactMap[plain.personalInformation?.contactId];
                if (contactInfo) {
                    plain.personalInformation.firstName = contactInfo.firstName;
                    plain.personalInformation.lastName = contactInfo.lastName;
                }
                return plain;
            });

            return sendResponse(res, 200, { contracts, pagination }, "Contracts retrieved successfully");
        }
    } catch (error) {
        console.log("Error while retrieving contract(s)", error);
        return sendResponse(res, 500, null, "An error occurred while retrieving the contract(s)");
    }
};

export const deleteContract: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Contract.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Contract deleted successfully");
    } catch (error) {
        console.log("Error while deleting Contract", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Contract");
    }
}