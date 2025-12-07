import { Request, RequestHandler, Response } from "express";
import { sendResponse } from "../../utils/response";
import { validateFields } from "../../utils/validateFields";
import { Quote } from "../../models/Quote";
import { Measurement } from "../../models/Measurement";
import { FinishingChoices } from "../../models/FinishingChoice";
import { CustomStain } from "../../models/CustomStain";
import { AddOn } from "../../models/AddOn";
import { Contact } from "../../models/Contact";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { Location } from "../../models/Locations";
import { Installations } from "../../models/Installations";
import { AdditionalWork } from "../../models/AdditionalWork";
import { AreaImages } from "../../models/AreaImages";
import { QuoteVendorPricing } from "../../models/QuoteVendorPricing";
import { Contract } from "../../models/Contract";
import { paginate } from "../../utils/paginate";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../config/database";
import moment from "moment";
import { sendEmailUtil } from "../emailController";
import { getContractEmailTemplate } from "../../utils/emailTemplate";
import { CollectionSystem } from "../../models/CollectionSystem";
import { Company } from "../../models/CompanyModel";

interface MeasurementType {
    id: number;
    quoteId: number;
    areas: string;
    sqFeets: number;
    install: string;
    sf: number;
    carpet: string;
    phase: string;
    createdBy?: string;
    createdTime?: Date;
    modifiedBy?: string;
    modifiedTime?: Date;
}

export const updateNewQuoteStatus: RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res
): Promise<any> => {
  try {
    const { id } = req.params;
    const { quoteStatus, amount, systems, modifiedBy, tax } = req.body;

    if (!id) {
      return sendResponse(res, 400, null, "Missing quote ID");
    }

    const updateData: any = {
      modifiedTime: new Date().toISOString(),
      modifiedBy,
    };

    if (quoteStatus) {
      updateData.quoteStatus = quoteStatus;

      if (quoteStatus === "Accepted") {
        const existingQuote = await Quote.findOne({
          where: { id },
          include: [
            {
              model: Contact,
              include: [
                {
                  model: Location,
                },
              ],
            },
          ],
        });

        const contact = existingQuote["Contact"];

        const personalInformation = {
          fax: contact.phone,
          city: contact["Locations"][0].city,
          email: contact.email,
          address: `${contact["Locations"][0].street}, ${contact["Locations"][0].city}`,
          state: contact["Locations"][0].state,
          jobName: `${contact.firstName} ${contact.lastName} - ${contact["Locations"][0].street} ${contact["Locations"][0].city}`,
          location: `${contact["Locations"][0].street}, ${contact["Locations"][0].city} , ${contact["Locations"][0].state} , ${contact["Locations"][0].country} , ${contact["Locations"][0].zipcode}`,
          cellPhone: contact.phone,
          jobPhone: contact.phone,
          workPhone: contact.phone,
          contactId: contact.id,
          proposalSubmittedTo: `${contact.firstName} ${contact.lastName}`,
          date: moment().format("MM/DD/YYYY"),
        };

        const newContract: any = await Contract.create({
          quoteId: id,
          installations: [],
          authorizedSignature:
            "https://blackforest-assets.s3.us-east-1.amazonaws.com/Signature.bmp",
          ownerOrOccupantSignature: null,
          dateOfContract: moment().format("MM/DD/YYYY"),
          contractStatus: "Draft",
          personalInformation,
          assignedEmployee: JSON.stringify(["notAssigned"]),
          createdBy: req.user.firstName + " " + req.user.lastName,
          createdByEmail: req.user.email,
          createdTime: new Date().toISOString(),
          modifiedBy: req.user.firstName + " " + req.user.lastName,
          modifiedTime: new Date().toISOString(),
        });

        const quoteData: any = await Quote.findByPk(id, {
          attributes: ["id", "createdByEmail"],
        });

        console.log(
          "🚀 ~ constupdateQuote:RequestHandler= ~ quoteData:",
          quoteData
        );

        // // Send the email
        const contractId = newContract?.id;
        const hostname = req.get("host");
        const isLocalhost = hostname.includes("localhost");
        const token = req.headers["authorization"]?.split(" ")[1];
        const encodeContractId = btoa(contractId);
        const encodedType = btoa("email");
        const encodedToken = btoa(token);
        const contractLink = isLocalhost
          ? `http://localhost:3000/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}`
          : `https://portal.blackforestfloors.com/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}`;

        const html = getContractEmailTemplate({
          contractLink,
          logoUrl:
            "https://blackforest-assets.s3.us-east-1.amazonaws.com/blackforest_logo.png",
          name: personalInformation.proposalSubmittedTo,
          email: personalInformation.email,
          address: personalInformation.location,
          quoteId: id
        });

        await sendEmailUtil({
          to: quoteData?.createdByEmail
            ? quoteData?.createdByEmail
            : isLocalhost
            ? "Vanna@yopmail.com"
            : "Osbornstevetheo@gmail.com",
          subject: `${personalInformation.proposalSubmittedTo} - ${id} Accepted the Quote`,
          html: html,
        });

        updateData.acceptedDate = new Date().toISOString();
      } 
      else if (quoteStatus === "Sent") {
        updateData.sentDate = new Date().toISOString();
      }
    }

    if (amount !== undefined) {
      updateData.totalFinishingAmount = amount;
    }

    if (tax !== undefined) {
      updateData.totalAddOnAmount = tax;
    }

    const [updatedRowsCount] = await Quote.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return sendResponse(res, 404, null, "Quote not found");
    }

    if (Array.isArray(systems) && systems.length > 0) {
      await CollectionSystem.destroy({ where: { quoteId: id } });

      const newSystems = systems.map((system) => ({
        quoteId: id,
        system: system.system,
        amount: system.included,
      }));

      await CollectionSystem.bulkCreate(newSystems);
    }

    return sendResponse(res, 200, null, "Quote updated successfully");
  } catch (error) {
    console.error("Error updating quote:", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while updating quote"
    );
  }
};

export const createNewQuote:RequestHandler = async (
  req: IGetUserAuthInfoRequest,
  res: Response
): Promise<any> => {
  try {
    const contact = req.body.company;
    const { tax , materialsDeposit , amount, systems,jobData } = req.body;

    const proposalSubmittedTo = contact.id;

    let quote: any = await Quote.create({
      proposalSubmittedTo,  
      createdBy: req.user.firstName + " " + req.user.lastName,
      createdByEmail: req.user.email,
      modifiedBy: contact.modifiedBy,
      totalFinishingAmount: amount,
      totalAddOnAmount: tax,
      materialsDeposit,
      jobData
    });

    quote = quote.toJSON();
    const collectionsSystems = systems.map((system) => {
      return {
        quoteId: quote.id,
        system: system.system,
        amount: system.included,
      };
    });
    await CollectionSystem.bulkCreate(collectionsSystems);
    return sendResponse(res, 201, quote, "New Quote created successfully");
  } catch (error) {
    console.log("Error while creating new quote", error);
    return sendResponse(
      res,
      500,
      null,
      "An error occurred while creating the quote"
    );
  }
};

export const createQuote: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            proposalSubmittedTo,
            woodSpecies,
            grade,
            widthThickness,
            finishType,
            finishSheen,
            stained,
            stain,
            notes,
            jobData,
            checkedPhases,
            quoteStatus = 'Draft',
            totalSquareFootage = 0,
            totalAddOnAmount = 0,
            totalFinishingAmount = 0,
            totalCustomStainAmount = 0
        } = req.body

        const requiredFields = [
            'proposalSubmittedTo',
            'woodSpecies',
            'grade',
            'widthThickness',
            'finishType',
            'finishSheen',
            'stained',
            'stain',
        ];

        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newQuote = await Quote.create({
            proposalSubmittedTo,
            woodSpecies,
            grade,
            widthThickness,
            finishType,
            finishSheen,
            stained,
            stain,
            notes,
            jobData: jobData,
            checkedPhases: checkedPhases,
            totalSquareFootage,
            totalAddOnAmount,
            totalFinishingAmount,
            totalCustomStainAmount,
            quoteStatus,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdByEmail: req.user.email,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newQuote, "Quote created successfully");
    } catch (error) {
        console.log("Error while creating quote", error);
        return sendResponse(res, 500, null, "An error occurred while creating the quote");
    }
}
export const createQuoteVendorPricing: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            quoteId,
            vendor,
            contact,
            brand,
            species,
            grade,
            size,
            availableQuantity,
            pricePerSqft,
            margin,
            totalPrice,
        } = req.body

        const requiredFields = [
            'quoteId',
            'vendor',
            'brand',
            'species',
            'grade',
            'size',
            'availableQuantity',
            'pricePerSqft',
            'margin',
        ];

        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newVendorPrice = await QuoteVendorPricing.create({
            quoteId,
            vendor,
            contact,
            brand,
            species,
            grade,
            size,
            availableQuantity,
            pricePerSqft,
            margin,
            totalPrice,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date().toISOString(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        });
        return sendResponse(res, 201, newVendorPrice, "Vendor price created successfully");
    } catch (error) {
        console.log("Error while creating Vendor price", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Vendor price");
    }
}

export const createMeasurements: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { measurements, quoteId } = req.body;

        if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
            return sendResponse(res, 400, null, "No measurements provided");
        }

        const requiredFields = ['areas', 'sqFeets', 'install', 'sf', 'carpet', 'phase'];

        for (let i = 0; i < measurements.length; i++) {
            const measurement = measurements[i];

            // Validate the fields for the current measurement
            const missingFields = requiredFields.filter(field => !measurement.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const newMeasurements = await Measurement.bulkCreate(
            measurements.map((measurement: any) => ({
                areas: measurement.areas,
                dimensions: measurement.dimensions,
                sqFeets: Number(measurement.sqFeets),
                install: measurement.install,
                sf: measurement.sf,
                carpet: measurement.carpet,
                phase: measurement.phase,
                quoteId: quoteId,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            }))
        );

        const totalSquareFootage = newMeasurements.reduce((sum, measurement: any) => sum + measurement.sqFeets, 0);

        await Quote.update(
            { totalSquareFootage },
            { where: { id: quoteId } }
        );

        return sendResponse(res, 201, { measurements: newMeasurements }, "Measurements created successfully");

    } catch (error) {
        console.log("Error while creating measurements", error);
        return sendResponse(res, 500, null, "An error occurred while creating the measurements");
    }
};

export const createFinishing: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { finishing, quoteId } = req.body;

        if (!Array.isArray(finishing)) {
            return sendResponse(res, 400, null, "Invalid finishing data");
        }

        if (finishing.length === 0) {
            await FinishingChoices.destroy({ where: { quoteId } });

            await Quote.update(
                { totalFinishingAmount: 0 },
                { where: { id: quoteId } }
            );

            return sendResponse(res, 201, { finishing: [] }, "All finishing choices removed successfully");
        }

        const requiredFields = ['phase', 'finishingOptions', 'squareFoots', 'pricePerSqft', 'amount'];

        for (let i = 0; i < finishing.length; i++) {
            const finishings = finishing[i];

            const missingFields = requiredFields.filter(field => !finishings.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const newFinishing = await FinishingChoices.bulkCreate(
            finishing.map((finish: any) => ({
                rooms: Array.isArray(finish.rooms.join) ? finish.rooms.join(', ') : finish.rooms,
                phase: finish.phase,
                finishingOptions: finish.finishingOptions,
                squareFoots: finish.squareFoots,
                pricePerSqft: finish.pricePerSqft,
                image: finish.image,
                amount: finish.amount,
                quoteId: quoteId,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            }))
        );

        const totalFinishingAmount = newFinishing.reduce((sum, finish: any) => sum + finish.amount, 0);

        await Quote.update(
            { totalFinishingAmount },
            { where: { id: quoteId } }
        );

        return sendResponse(res, 201, { finishing: newFinishing }, "Finishing created successfully");

    } catch (error) {
        console.log("Error while creating finishing", error);
        return sendResponse(res, 500, null, "An error occurred while creating the finishing");
    }
};

export const createCustomStain: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { customStain, quoteId } = req.body;

        if (!Array.isArray(customStain)) {
            return sendResponse(res, 400, null, "Invalid customStain data");
        }

        if (customStain.length === 0) {
            await CustomStain.destroy({ where: { quoteId } });

            // Update the quote with totalCustomStainAmount = 0
            await Quote.update(
                { totalCustomStainAmount: 0 },
                { where: { id: quoteId } }
            );

            return sendResponse(res, 201, { customStain: [] }, "All custom stains removed successfully");
        }

        const requiredFields = ['rooms', 'phase', 'customStain', 'squareFoots', 'pricePerSqft', 'amount'];

        for (const custom of customStain) {
            const missingFields = requiredFields.filter(field => !custom.hasOwnProperty(field));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const newCustomStain = await CustomStain.bulkCreate(
            customStain.map((custom: any) => ({
                rooms: Array.isArray(custom.rooms) ? custom.rooms.join(', ') : custom.rooms,
                phase: custom.phase,
                customStain: custom.customStain,
                squareFoots: custom.squareFoots,
                pricePerSqft: custom.pricePerSqft,
                amount: custom.amount,
                quoteId,
                createdBy: `${req.user.firstName} ${req.user.lastName}`,
                createdTime: new Date().toISOString(),
                modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                modifiedTime: new Date().toISOString()
            }))
        );

        const totalCustomStainAmount = newCustomStain.reduce((sum, custom: any) => sum + custom.amount, 0);

        await Quote.update(
            { totalCustomStainAmount },
            { where: { id: quoteId } }
        );

        return sendResponse(res, 201, { customStain: newCustomStain }, "Custom Stain created successfully");

    } catch (error) {
        console.error("Error while creating customStain:", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Custom Stain");
    }
};

export const createAddOn: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { addOn, quoteId } = req.body;

        if (!Array.isArray(addOn)) {
            return sendResponse(res, 400, null, "Invalid addOn data");
        }

        if (addOn.length === 0) {
            await AddOn.destroy({ where: { quoteId } });

            await Quote.update(
                { totalAddOnAmount: 0 },
                { where: { id: quoteId } }
            );

            return sendResponse(res, 201, { addOn: [] }, "All addOn removed successfully");
        }

        const requiredFields = ['service', 'phase', 'squareFeet', 'pricePerSqft', 'amount'];

        for (let i = 0; i < addOn.length; i++) {
            const addOns = addOn[i];

            const missingFields = requiredFields.filter(field => !addOns.hasOwnProperty(field));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const newAddOn = await AddOn.bulkCreate(
            addOn.map((add: any) => ({
                service: add.service,
                phase: add.phase,
                squareFeet: add.squareFeet,
                pricePerSqft: add.pricePerSqft,
                basePrice: add.basePrice,
                additionalPrice: add.additionalPrice,
                note: add.note ? add.note : '',
                amount: add.amount,
                quoteId: quoteId,
                ventSize: add.ventSize,
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            }))
        );

        const totalAddOnAmount = newAddOn.reduce((sum, add: any) => sum + add.amount, 0);

        await Quote.update(
            { totalAddOnAmount },
            { where: { id: quoteId } }
        );

        return sendResponse(res, 201, { addOn: newAddOn }, "Add On created successfully");

    } catch (error) {
        console.log("Error while creating Add On", error);
        return sendResponse(res, 500, null, "An error occurred while creating the Add On");
    }
};

export const getQuote: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt(req.query.page as string) || null;
        const pageSize = parseInt(req.query.pageSize as string) || null;
        const fetchAll = req.query.fetchAll === 'true';
        const status = req.query.status as string;
        const search = req.query.search ? req.query.search.toString() : null;
        const contact = req.query.contact ? parseInt(req.query.contact as string) : null;

        let contactIds: number[] = [];
        let contactMap: Record<number, string> = {}; // Map of contactId to contact details

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ],
            ...(status ? { quoteStatus: status } : {}),
            ...(contactIds.length > 0 ? { proposalSubmittedTo: { [Op.in]: contactIds } } : {}),
            ...(contact ? { proposalSubmittedTo: contact } : {})
        };

        if (search) {
            whereCondition[Op.or] = [
                { quoteStatus: { [Op.like]: `%${search}%` } },
                Sequelize.where(
                    Sequelize.json("jobData.jobName"),
                    "LIKE",
                    `%${search}%`
                ),
                Sequelize.where(
                    Sequelize.json("jobData.jobAddress"),
                    "LIKE",
                    `%${search}%`
                ),
                Sequelize.where(
                    Sequelize.json("jobData.quotationValue"),
                    "LIKE",
                    `%${search}%`
                )
            ];
        }

        if (search) {
            const contacts = await Contact.findAll({
                where: {
                    [Op.or]: [
                        { firstName: { [Op.like]: `%${search}%` } },
                        { lastName: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { phone: { [Op.like]: `%${search}%` } },
                    ],
                },
                attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            });

            contactIds = contacts.map((contact: any) => contact.id);
            contactMap = contacts.reduce((acc, contact: any) => {
                acc[contact.id] = `${contact.firstName} ${contact.lastName} (${contact.email}, ${contact.phone})`;
                return acc;
            }, {} as Record<number, string>);

            if (contactIds.length > 0) {
                whereCondition[Op.or].push({
                    proposalSubmittedTo: { [Op.in]: contactIds }
                });
            }
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Contact,
                    attributes: ['firstName', 'lastName', 'email', 'phone', 'id', 'operationsManager', 'doNotSendEmail', 'companyId','clientSource', 'clientDetailsAvailability'],
                    required: false,
                    include: [
                        { model: Location},
                        { model: Company }
                    ],
                    where: search
                        ? {
                            [Op.or]: [
                                { firstName: { [Op.like]: `%${search}%` } },
                                { lastName: { [Op.like]: `%${search}%` } },
                                { email: { [Op.like]: `%${search}%` } },
                                { phone: { [Op.like]: `%${search}%` } },
                            ],
                        }
                        : undefined
                },
                {
                    model: AreaImages,
                },
                {
                    model: Contract,
                    attributes: ['id'],
                }
            ],
            order: [['createdTime', 'DESC']],
        };

        let quotes;
        let pagination;

        if (fetchAll) {
            quotes = await Quote.findAll(paginationOptions);
            pagination = null;
        } else {
            const result = await paginate(Quote, page, pageSize, paginationOptions);
            quotes = result.data;
            pagination = result.pagination;
        }

        quotes = quotes.map(item => ({
            ...item.toJSON(),
            contactData: contactMap[item.proposalSubmittedTo] || null
        }));

        return sendResponse(res, 200, { quotes, pagination }, "Quotes found");
    } catch (error) {
        console.error("Error while fetching quotes", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the quotes");
    }
};

export const getSingleQuote: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const quote = await Quote.findByPk(id, {
            include: [
                {
                    model: Contact,
                    attributes: ['firstName', 'lastName', 'email', 'phone', 'id', 'operationsManager'],
                    required: true,
                    include: [
                        { model: Location },
                    ]
                },
                { model: Measurement },
                { model: FinishingChoices },
                { model: CustomStain },
                { model: AddOn },
                { model: Installations },
                { model: AdditionalWork },
                { model: AreaImages },
                { model: QuoteVendorPricing },
                { model: Contract },
                {model : CollectionSystem}
            ]
        });

        if (!quote) {
            return sendResponse(res, 404, null, "Quote not found");
        }

        console.log("Quote fetched successfully", quote);

        return sendResponse(res, 200, quote, "Quote found");
    } catch (error) {
        console.error("Error while fetching Quote", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the Quote");
    }
};

export const updateQuote: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            proposalSubmittedTo,
            woodSpecies,
            grade,
            widthThickness,
            finishType,
            finishSheen,
            stained,
            stain,
            notes,
            jobData,
            checkedPhases,
            totalSquareFootage,
            totalAddOnAmount,
            totalFinishingAmount,
            quoteStatus,
            totalCustomStainAmount,
            personalInformation,
            installations,
            finishing,
            addOn,
            customStain,
            additionalWork,
        } = req.body

        const requiredFields = [
            'proposalSubmittedTo',
            'woodSpecies',
            'grade',
            'widthThickness',
            'finishType',
            'finishSheen',
            'stained',
            'stain',
        ];

        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const updateData: any = {
            proposalSubmittedTo,
            woodSpecies,
            grade,
            widthThickness,
            finishType,
            finishSheen,
            stained,
            stain,
            notes,
            jobData,
            checkedPhases,
            totalSquareFootage,
            totalAddOnAmount,
            quoteStatus,
            acceptedDate: quoteStatus === 'Accepted' ? new Date().toISOString() : null,
            totalFinishingAmount,
            totalCustomStainAmount,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString(),
        };

        // Only include sentDate if status is 'Sent'
        if (quoteStatus === 'Sent') {
            updateData.sentDate = new Date().toISOString();
        }

        const updateQuote: any = await Quote.update(updateData, {
            where: { id: id },
        });


        if (quoteStatus === 'Accepted') {

            //creating contract based on quote
            const newContract: any = await Contract.create({
                quoteId: id,
                installations,
                finishing,
                addOn,
                customStain,
                additionalWork,
                authorizedSignature: "https://blackforest-assets.s3.us-east-1.amazonaws.com/Signature.bmp",
                ownerOrOccupantSignature: null,
                dateOfContract: moment().format('MM/DD/YYYY'),
                contractStatus: 'Draft',
                personalInformation,
                phases: checkedPhases,
                jobName: personalInformation?.jobName,
                contact: personalInformation?.proposalSubmittedTo,
                jobAddress: personalInformation?.location,
                assignedEmployee: JSON.stringify(["notAssigned"]),
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdByEmail: req.user.email,
                createdTime: new Date().toISOString(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date().toISOString()
            });

            const quoteData: any = await Quote.findByPk(id, {
                attributes: ['id', 'createdByEmail'],
                include: [
                    {
                        model: Contact,
                        attributes: ['firstName', 'lastName', 'email', 'id'],
                        required: true,
                        include: [
                            { model: Location },
                        ]
                    }
                ]
            })

            const contact = quoteData["Contact"];
            const location = contact?.Locations?.[0];
            const contactDetails = {
                name: `${contact.firstName} ${contact.lastName}`,
                email: contact.email,
                location: [
                    location?.street || '',
                    location?.city || '',
                    location?.state || '',
                    location?.country || '',
                    location?.zipcode || '',
                ]
                    .filter(Boolean)
                    .join(', ')
            };

            // Send the email
            const contractId = newContract?.id
            const hostname = req.get('host')
            const isLocalhost = hostname.includes('localhost');

            const token = req.headers['authorization']?.split(' ')[1];
            const encodeContractId = btoa(contractId);
            const encodedType = btoa('email');
            const encodedToken = btoa(token);

            const contractLink = isLocalhost ? `http://localhost:3000/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}` : `https://portal.blackforestfloors.com/auth/email-contract/${encodeContractId}?type=${encodedType}&varified=${encodedToken}`;

            const html = getContractEmailTemplate({
                contractLink,
                logoUrl: "https://blackforest-assets.s3.us-east-1.amazonaws.com/blackforest_logo.png",
                name: contactDetails.name,
                email: contactDetails.email,
                address: contactDetails.location,
                quoteId: id
            })
            await sendEmailUtil({
                to: quoteData?.createdByEmail ? quoteData?.createdByEmail : isLocalhost ? 'Vanna@yopmail.com' : 'Osbornstevetheo@gmail.com',
                subject: `${contactDetails.name} - ${id} Accepted the Quote`,
                html: html
            });

        }
        return sendResponse(res, 201, updateQuote, "Quote updated successfully");

    } catch (error) {
        console.log("Error while updating quote", error);
        return sendResponse(res, 500, null, "An error occurred while updating the quote");
    }
}

export const updateQuoteVendorPricing: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            quoteId,
            vendor,
            contact,
            brand,
            species,
            grade,
            size,
            availableQuantity,
            pricePerSqft,
            totalPrice,
            margin,
        } = req.body

        const requiredFields = [
            'quoteId',
            'vendor',
            'brand',
            'species',
            'grade',
            'size',
            'availableQuantity',
            'pricePerSqft',
            'margin',
        ];

        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const upadteVendorPrice = await QuoteVendorPricing.update({
            quoteId,
            vendor,
            contact,
            brand,
            species,
            grade,
            size,
            availableQuantity,
            pricePerSqft,
            margin,
            totalPrice,
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date().toISOString()
        },
            {
                where: { id: id },
            }
        );
        return sendResponse(res, 201, upadteVendorPrice, "Vendor price updated successfully");
    } catch (error) {
        console.log("Error while updating Vendor price", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Vendor price");
    }
}

export const updateMeasurements: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { measurements, quoteId } = req.body;

        if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
            return sendResponse(res, 400, null, "No measurements provided");
        }

        const requiredFields = ['areas', 'sqFeets', 'install', 'sf', 'carpet', 'phase'];

        for (const measurement of measurements) {
            const missingFields = requiredFields.filter(field => !(field in measurement));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const existingMeasurements = await Measurement.findAll({ where: { quoteId } }) as unknown as MeasurementType[];

        const updatedMeasurements: MeasurementType[] = [];
        const newMeasurements: Partial<MeasurementType>[] = [];
        const receivedMeasurementIds = new Set(measurements.map(m => m.id).filter(Boolean)); // IDs of received measurements

        for (const measurement of measurements) {
            if (measurement.id) {
                const existingMeasurement: any = await Measurement.findByPk(measurement.id) as unknown as MeasurementType;
                if (existingMeasurement) {
                    await existingMeasurement.update({
                        ...measurement,
                        modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                        modifiedTime: new Date().toISOString()
                    });
                    updatedMeasurements.push(existingMeasurement);
                } else {
                    return sendResponse(res, 404, null, `Measurement with ID ${measurement.id} not found`);
                }
            } else {
                newMeasurements.push({
                    ...measurement,
                    createdBy: `${req.user.firstName} ${req.user.lastName}`,
                    createdTime: new Date().toISOString(),
                    modifiedBy: `${req.user.firstName} ${req.user.lastName}`,
                    modifiedTime: new Date().toISOString(),
                    quoteId
                });
            }
        }

        if (newMeasurements.length > 0) {
            const createdMeasurements: any = await Measurement.bulkCreate(newMeasurements);
            updatedMeasurements.push(...createdMeasurements);
        }

        const measurementsToDelete = existingMeasurements.filter(m => !receivedMeasurementIds.has(m.id));
        if (measurementsToDelete.length > 0) {
            await Measurement.destroy({
                where: { id: measurementsToDelete.map(m => m.id) },
            });
        }

        const totalSquareFootage = await Measurement.sum('sqFeets', { where: { quoteId } });

        await Quote.update({ totalSquareFootage }, { where: { id: quoteId } });

        return sendResponse(res, 201, { measurements: updatedMeasurements }, "Measurements updated successfully");

    } catch (error) {
        console.error("Error while updating measurements", error);
        return sendResponse(res, 500, null, "An error occurred while updating the measurements");
    }
};

export const updateFinishing: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { finishing, quoteId } = req.body;

        if (!Array.isArray(finishing)) {
            return sendResponse(res, 400, null, "Invalid finishing data");
        }

        if (finishing.length === 0) {
            await FinishingChoices.destroy({ where: { quoteId } });

            await Quote.update(
                { totalFinishingAmount: 0 },
                { where: { id: quoteId } }
            );

            return sendResponse(res, 201, { finishing: [] }, "All finishing choices removed successfully");
        }

        const requiredFields = ['phase', 'finishingOptions', 'squareFoots', 'pricePerSqft', 'amount'];

        for (const finish of finishing) {
            const missingFields = requiredFields.filter(field => !(field in finish));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }
        const existingFinishing = await FinishingChoices.findAll({ where: { quoteId } }) as unknown as MeasurementType[];

        const updatedFinishing: any = [];
        const newFinishing: any = [];
        const receivedFinishinIds = new Set(finishing.map(m => m.id).filter(Boolean));
        for (const finish of finishing) {
            if (finish.id) {
                const rooms = Array.isArray(finish.rooms) ? finish.rooms.join(", ") : finish.rooms;
                const existingFinishing = await FinishingChoices.findByPk(finish.id);
                if (existingFinishing) {
                    await existingFinishing.update({ ...finish, rooms, modifiedBy: req.user.firstName + " " + req.user.lastName, modifiedTime: new Date().toISOString() });
                    updatedFinishing.push(existingFinishing);
                } else {
                    return sendResponse(res, 404, null, `Finishing with ID ${finish.id} not found`);
                }
            } else {
                const rooms = Array.isArray(finish.rooms) ? finish.rooms.join(", ") : finish.rooms;
                newFinishing.push({
                    ...finish, rooms, createdBy: req.user.firstName + " " + req.user.lastName,
                    createdTime: new Date().toISOString(),
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date().toISOString(), quoteId
                });
            }
        }

        if (newFinishing.length > 0) {
            const createdFinishing = await FinishingChoices.bulkCreate(newFinishing);
            updatedFinishing.push(...createdFinishing);
        }

        const measurementsToDelete = existingFinishing.filter(m => !receivedFinishinIds.has(m.id));
        if (measurementsToDelete.length > 0) {
            await FinishingChoices.destroy({
                where: { id: measurementsToDelete.map(m => m.id) },
            });
        }

        const totalFinishingAmount = await FinishingChoices.sum('amount', { where: { quoteId } });

        await Quote.update({ totalFinishingAmount }, { where: { id: quoteId } });

        return sendResponse(res, 201, { finishing: updatedFinishing }, "Finishing updated successfully");

    } catch (error) {
        console.log("Error while updating finishing", error);
        return sendResponse(res, 500, null, "An error occurred while updating the finishing");
    }
};

export const updateCustomStain: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { customStain, quoteId } = req.body;

        if (!Array.isArray(customStain)) {
            return sendResponse(res, 400, null, "Invalid customStain data");
        }

        if (customStain.length === 0) {
            // Save an empty array in the database (set totalCustomStainAmount to 0)
            await Quote.update(
                { totalCustomStainAmount: 0 },
                { where: { id: quoteId } }
            );
            return sendResponse(res, 201, { customStain: [] }, "Custom Stain saved successfully");
        }
        const requiredFields = ['rooms', 'phase', 'customStain', 'squareFoots', 'pricePerSqft', 'amount'];

        for (const stain of customStain) {
            const missingFields = requiredFields.filter(field => !(field in stain));
            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }

        const existingCustomStain = await CustomStain.findAll({ where: { quoteId } }) as unknown as MeasurementType[];

        const updatedCustomStain: any = [];
        const newCustomStain: any = [];
        const receivedCustomStainIds = new Set(customStain.map(m => m.id).filter(Boolean)); // IDs of received measurements


        for (const custom of customStain) {
            const rooms = Array.isArray(custom.rooms) ? custom.rooms.join(", ") : custom.rooms;
            if (custom.id) {
                const existingCustomStain = await CustomStain.findByPk(custom.id);
                if (existingCustomStain) {
                    await existingCustomStain.update({
                        ...custom,
                        rooms,
                        modifiedBy: req.user.firstName + " " + req.user.lastName,
                        modifiedTime: new Date().toISOString(),
                    });
                    updatedCustomStain.push(existingCustomStain);
                } else {
                    return sendResponse(res, 404, null, `Custom Stain with ID ${custom.id} not found`);
                }
            } else {
                const rooms = Array.isArray(custom.rooms) ? custom.rooms.join(", ") : custom.rooms;
                newCustomStain.push({
                    ...custom, rooms, createdBy: req.user.firstName + " " + req.user.lastName,
                    createdTime: new Date().toISOString(),
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date().toISOString(), quoteId
                });
            }
        }

        if (newCustomStain.length > 0) {
            const createdCustomStain = await CustomStain.bulkCreate(newCustomStain);
            updatedCustomStain.push(...createdCustomStain);
        }

        const customStainToDelete = existingCustomStain.filter(m => !receivedCustomStainIds.has(m.id));
        if (customStainToDelete.length > 0) {
            await CustomStain.destroy({
                where: { id: customStainToDelete.map(m => m.id) },
            });
        }

        const totalCustomStainAmount = await CustomStain.sum('amount', { where: { quoteId } });

        await Quote.update({ totalCustomStainAmount }, { where: { id: quoteId } });

        return sendResponse(res, 201, { customStain: updatedCustomStain }, "Custom Stain updated successfully");

    } catch (error) {
        console.log("Error while updating customStain", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Custom Stain");
    }
};

export const updateAddOn: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { addOn, quoteId } = req.body;

        if (!Array.isArray(addOn)) {
            return sendResponse(res, 400, null, "Invalid addOn data");
        }

        if (addOn.length === 0) {
            await AddOn.destroy({ where: { quoteId } });

            await Quote.update(
                { totalAddOnAmount: 0 },
                { where: { id: quoteId } }
            );

            return sendResponse(res, 201, { addOn: [] }, "All addOn removed successfully");
        }

        const requiredFields = ['service', 'phase', 'squareFeet', 'pricePerSqft', 'amount'];

        for (const add of addOn) {
            const missingFields = requiredFields.filter(field => !(field in add));

            if (missingFields.length > 0) {
                return sendResponse(res, 400, null, `Missing required fields: ${missingFields.join(", ")}`);
            }
        }


        const existingAddOn = await AddOn.findAll({ where: { quoteId } }) as unknown as MeasurementType[];

        const updatedAddOn: any[] = [];
        const newAddOn: any[] = [];
        const receivedAddonIds = new Set(addOn.map(m => m.id).filter(Boolean)); // IDs of received measurements


        for (const add of addOn) {
            if (add.id) {
                const existingAddOn = await AddOn.findByPk(add.id);
                if (existingAddOn) {
                    await existingAddOn.update({
                        ...add,
                        modifiedBy: req.user.firstName + " " + req.user.lastName,
                        modifiedTime: new Date().toISOString(),
                    });
                    updatedAddOn.push(existingAddOn);
                } else {
                    return sendResponse(res, 404, null, `Add-On with ID ${add.id} not found`);
                }
            } else {
                newAddOn.push({
                    ...add,
                    quoteId,
                    createdBy: req.user.firstName + " " + req.user.lastName,
                    createdTime: new Date().toISOString(),
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date().toISOString(),
                });
            }
        }

        if (newAddOn.length > 0) {
            const createdAddOn = await AddOn.bulkCreate(newAddOn);
            updatedAddOn.push(...createdAddOn);
        }

        const addOnToDelete = existingAddOn.filter(m => !receivedAddonIds.has(m.id));
        if (addOnToDelete.length > 0) {
            await AddOn.destroy({
                where: { id: addOnToDelete.map(m => m.id) },
            });
        }

        const totalAddOnAmount = await AddOn.sum('amount', { where: { quoteId } });

        await Quote.update({ totalAddOnAmount }, { where: { id: quoteId } });

        return sendResponse(res, 201, { addOn: updatedAddOn }, "Add-On updated successfully");

    } catch (error) {
        console.log("Error while updating Add-On", error);
        return sendResponse(res, 500, null, "An error occurred while updating the Add-On");
    }
};

export const deleteQuote: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await Quote.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "Quote deleted successfully");
    } catch (error) {
        console.log("Error while deleting Quote", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the Quote");
    }
}