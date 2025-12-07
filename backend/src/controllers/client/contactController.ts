import { Request, RequestHandler, Response } from "express";
import { Contact } from "../../models/Contact";
import { sendResponse } from "../../utils/response";
import { validateFields } from "../../utils/validateFields";
import { Location } from "../../models/Locations";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { paginate } from "../../utils/paginate";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../config/database";
import { Company } from "../../models/CompanyModel";
import { ContractorEmployee } from "../../models/ContractorEmployee";
interface ContactRequestBody {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  additionalPhone: string;
  doNotSendEmail: boolean;
  contractorEmployee: string;
  clientSource: "Direct" | "Contractor";
  clientDetailsAvailability: "Yes" | "No";
  operationsManager: string;
  message: string;
}

export const createContact: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      additionalPhone,
      doNotSendEmail,
      contractorEmployee,
      message,
      operationsManager,
      clientSource,
      clientDetailsAvailability,
    }: ContactRequestBody = req.body;

    if (!clientSource || (clientSource !== "Direct" && clientSource !== "Contractor")) {
      return sendResponse(res, 400, null, "Invalid or missing Client Source. Must be 'Direct' or 'Contractor'");
    }

    if (clientSource === "Contractor" && !clientDetailsAvailability) {
      return sendResponse(res, 400, null, "Client Details Availability is required for Contractor Client Source");
    }

    let requiredFields: string[] = [];

    if (clientSource === "Direct") {
      requiredFields = ["firstName", "email", "phone", "operationsManager"];
    } else if (clientSource === "Contractor") {
      requiredFields = [
        "companyName",
        "contractorEmployee",
        "operationsManager",
        "clientDetailsAvailability",
      ];
    }

    if (!validateFields(requiredFields, req, res)) {
      return;
    }

    if (clientSource === "Direct" && email) {
      const existingContact = await Contact.findOne({ where: { email } });
      if (existingContact) {
        return sendResponse(res, 400, null, "A contact with this email already exists");
      }
    }

    const newContact = await Contact.create({
      firstName,
      lastName,
      companyName,
      companyId: companyName ? parseInt(companyName) : null,
      email: email || null,
      phone,
      additionalPhone,
      doNotSendEmail,
      contractorEmployee,
      message,
      operationsManager,
      clientSource,
      clientDetailsAvailability,
      createdBy: req.user.firstName + " " + req.user.lastName,
      createdTime: new Date().toISOString(),
      modifiedBy: req.user.firstName + " " + req.user.lastName,
      modifiedTime: new Date().toISOString(),
    });

    return sendResponse(res, 201, newContact, "Contact created successfully");
  } catch (error) {
    console.log("Error while creating contact", error);
    return sendResponse(res, 500, null, "An error occurred while creating the contact");
  }
};

export const getContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
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
            const searchableFields = ["firstName", "lastName", "email", "phone", "createdBy", "modifiedBy"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        {
                            [Op.and]: [
                                { firstName: { [Op.like]: `%${search.split(" ")[0]}%` } },
                                { lastName: { [Op.like]: `%${search.split(" ")[1] || ""}%` } }
                            ]
                        }, {
                            id: {
                                [Op.in]: Sequelize.literal(`(
                                      SELECT contactId FROM locations
                                      WHERE country LIKE '%${search}%' OR zipcode LIKE '%${search}%'
                                  )`)
                            }
                        }
                    ]
                }
            ];
        }

      const paginationOptions: any = {
        where: whereCondition,
        include: [
          {
            model: Location,
            required: false,
            include: [
              {
                model: Contact,
                attributes: ["firstName", "lastName"],
              }
            ]
          },
          {
            model: Company,
            required: false,
            attributes: ["companyName"],
          },
          {
            model: ContractorEmployee,
            required: false,
            attributes: ["firstName", "lastName", "phone", "email"],
          },
        ],
        order: [
          ["createdTime", "DESC"],
          [Location, "id", "DESC"]
        ],
      };

        let contacts;
        let pagination;

        if (page !== null && pageSize !== null) {
            const result = await paginate(Contact, page, pageSize, paginationOptions);
            contacts = result.data;
            pagination = result.pagination;
        } else {
            contacts = await Contact.findAll(paginationOptions);
            pagination = null; // No pagination metadata
        }

        console.log("Contacts fetched successfully", contacts?.length);

        return sendResponse(res, 200, { contacts, pagination }, "Contacts found");
    } catch (error) {
        console.error("Error while fetching contacts", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the contacts");
    }
};

export const updateContact: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const id = req.params.id;
    const {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      additionalPhone,
      doNotSendEmail,
      contractorEmployee,
      message,
      operationsManager,
      clientSource,
      clientDetailsAvailability,
    }: ContactRequestBody = req.body;

    if (!clientSource || (clientSource !== "Direct" && clientSource !== "Contractor")) {
      return sendResponse(res, 400, null, "Invalid or missing Client Source. Must be 'Direct' or 'Contractor'");
    }

    if (clientSource === "Contractor" && !clientDetailsAvailability) {
      return sendResponse(res, 400, null, "Client Details Availability is required for Contractor Client Source");
    }

    let requiredFields: string[] = [];

    if (clientSource === "Direct") {
      requiredFields = ["firstName", "email", "phone", "operationsManager"];
    } else if (clientSource === "Contractor") {
      requiredFields = [
        "companyName",
        "contractorEmployee",
        "operationsManager",
        "clientDetailsAvailability",
      ];
    }

    if (!validateFields(requiredFields, req, res)) {
      return;
    }

    // Prevent duplicate email (exclude current record)
    if (clientSource === "Direct" && email) {
      const existingContact = await Contact.findOne({ where: { email, id: { [Op.ne]: id } } });
      if (existingContact) return sendResponse(res, 400, null, "A contact with this email already exists");
    }

    const [rowsUpdated] = await Contact.update(
      {
        firstName,
        lastName,
        companyName,
        companyId: companyName ? parseInt(companyName) : null,
        email: email || null,
        phone,
        additionalPhone,
        doNotSendEmail,
        contractorEmployee,
        message,
        operationsManager,
        clientSource,
        clientDetailsAvailability,
        modifiedBy: req.user.firstName + " " + req.user.lastName,
        modifiedTime: new Date().toISOString(),
      },
      { where: { id } }
    );

    if (rowsUpdated === 0) return sendResponse(res, 404, null, "Contact not found");

    return sendResponse(res, 201, null, "Contact updated successfully");
  } catch (error) {
    console.log("Error while updating contact", error);
    return sendResponse(res, 500, null, "An error occurred while updating the contact");
  }
};


export const deleteContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            // Mark the contact as deleted
            await Contact.update(
                { delete: 'Yes' },
                { where: { id: id }, transaction }
            );
            await Location.update(
                { delete: 'Yes' },
                { where: { contactId: id }, transaction }
            );

            await transaction.commit();

            return sendResponse(res, 201, null, "Contact and related data deleted successfully");
        } catch (error) {
            // Rollback in case of an error
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.log("Error while deleting contact", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the contact");
    }
}

export const uploadContactImages: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const id = req.params.id;
    const { jobImages, quoteImages, timelogImages } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return sendResponse(res, 404, null, "Contact not found");
    }
    
    const updatedJobImages = [
          ...((contact.get("jobImages") as string[]) || []),
          ...(jobImages || [])
      ];

    const updatedQuoteImages = [
          ...((contact.get("quoteImages") as string[]) || []),
          ...(quoteImages || [])
      ];

    const updatedTimelogImages = [
          ...((contact.get("timelogImages") as string[]) || []),
          ...(timelogImages || [])
      ];

    const updatedContact = await Contact.update(
      {
        jobImages: updatedJobImages,
        quoteImages: updatedQuoteImages,
        timelogImages: updatedTimelogImages,
        modifiedBy: req.user.firstName + " " + req.user.lastName,
        modifiedTime: new Date().toISOString(),
      },
      {
        where: { id: id },
      }
    );
    return sendResponse(
      res,
      201,
      updatedContact,
      "Contact images uploaded succesfully"
    );
  } catch (error) {
    console.log("Error while uploading contact images", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while uploading the contact images"
    );
  }
};