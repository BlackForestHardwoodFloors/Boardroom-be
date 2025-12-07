import { Request, RequestHandler, Response } from "express";
import { validateFields } from "../../utils/validateFields";
import { Location } from "../../models/Locations";
import { sendResponse } from "../../utils/response";
import { Contact } from "../../models/Contact";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { paginate } from "../../utils/paginate";
import { Op } from "sequelize";

interface LocationRequestBody {
    id: string;
    contactId: string;
    contactName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
    addressType: string;
}

export const createLocation: RequestHandler = async (
    req: IGetUserAuthInfoRequest,
    res: Response
): Promise<any> => {
    try {
        const { contactId, jobAddress, billingAddress } = req.body;

        const contact = await Contact.findByPk(contactId);
        if (!contact) {
            return sendResponse(res, 404, null, "Contact not found");
        }

        const createdBy = `${req.user.firstName} ${req.user.lastName}`;
        const createdTime = new Date().toISOString();

        let newJobLocation: any = null;
        let newBillingLocation: any = null;

        if (jobAddress) {
            newJobLocation = await Location.create({
                ...jobAddress,
                contactId,
                createdBy,
                createdTime,
                modifiedBy: createdBy,
                modifiedTime: createdTime,
            });

            await contact.update({ jobLocationId: newJobLocation.id });
        }

        if (billingAddress) {
            newBillingLocation = await Location.create({
                ...billingAddress,
                contactId,
                createdBy,
                createdTime,
                modifiedBy: createdBy,
                modifiedTime: createdTime,
            });

            await contact.update({ billingLocationId: newBillingLocation.id });
        }

        const updatedContact = await Contact.findByPk(contactId, {
          include: [{ model: Location }],
        });

        return sendResponse(
            res,
            201,
            updatedContact,
            "Locations created and linked to contact successfully"
        );
    } catch (error) {
        console.error("Error while creating location:", error);
        return sendResponse(
            res,
            500,
            null,
            "An error occurred while creating the locations"
        );
    }
};


export const updateLocation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { contactId, jobAddress, billingAddress } = req.body;
        console.log("Request Body: update ===>", req.body);

        const contact = await Contact.findByPk(contactId);
        if (!contact) {
            return sendResponse(res, 404, null, "Contact not found");
        }

        await contact.update({ modifiedBy: req.user.firstName + " " + req.user.lastName });

        if (jobAddress?.id) {
            await Location.update(
                {
                    ...jobAddress,
                    modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                    modifiedTime: new Date().toISOString()
                },
                { where: { id: jobAddress.id } }
            );
        } else if (jobAddress) {
            await Location.create({
                ...jobAddress,
                contactId,
                modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                createdBy: `${req.user.firstName} ${req.user.lastName}`
            });
        }

        if (billingAddress?.id) {
            await Location.update(
                {
                    ...billingAddress,
                    modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                    modifiedTime: new Date().toISOString()
                },
                { where: { id: billingAddress.id } }
            );
        } else if (billingAddress) {
            await Location.create({
                ...billingAddress,
                contactId,
                modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                createdBy: `${req.user.firstName} ${req.user.lastName}`
            });
        }

        const updatedContact = await Contact.findByPk(contactId, {
            include: [{ model: Location, as: 'Locations' }]
        });

        return sendResponse(res, 200, updatedContact, "Contact and locations updated successfully");
    } catch (error) {
        console.error("Error updating contact and locations:", error);
        return sendResponse(res, 500, null, "An error occurred while updating the contact and locations");
    }
};

export const getLocation: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };

        if (search) {
            const searchableFields = ["street", "city", "state", "country", "zipcode", "contactName", "addressType"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        }))
                    ]
                }
            ];
        }


        const paginationOptions: any = {
            where: whereCondition,
            order: [["createdTime", "DESC"]],
            include: [
                {
                    model: Contact,
                    attributes: ["firstName", "lastName"]
                }
            ],
        };

        let locations;
        let pagination;

        if (!page || !pageSize) {
            locations = await Location.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(Location, page, pageSize, paginationOptions);
            locations = result.data;
            pagination = result.pagination;
        }
        return sendResponse(res, 200, { locations, pagination }, "Location created and linked to contact successfully");
    } catch (error) {
        console.log("Error while fetching location", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the location");
    }
};

export const deleteLocation: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Location.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "location deleted successfully");
    } catch (error) {
        console.log("Error while deleting location", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the location");
    }
}
