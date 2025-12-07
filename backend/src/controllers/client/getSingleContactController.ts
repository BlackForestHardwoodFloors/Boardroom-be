import { RequestHandler, Response } from "express";
import { Contact } from "../../models/Contact";
import { IGetUserAuthInfoRequest } from "../../middleware/authentication";
import { Quote } from "../../models/Quote";
import { Measurement } from "../../models/Measurement";
import { FinishingChoices } from "../../models/FinishingChoice";
import { CustomStain } from "../../models/CustomStain";
import { AddOn } from "../../models/AddOn";
import { Installations } from "../../models/Installations";
import { AdditionalWork } from "../../models/AdditionalWork";
import { sendResponse } from "../../utils/response";
import { Location } from "../../models/Locations";
import { AreaImages } from "../../models/AreaImages";
import { QuoteVendorPricing } from "../../models/QuoteVendorPricing";
import { Contract } from "../../models/Contract";
import { Company } from "../../models/CompanyModel";
import { ContractorEmployee } from "../../models/ContractorEmployee";

export const getSingleContact: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Step 1: Fetch Contact with Location (Light Query)
        const contact = await Contact.findByPk(id, {
          include: [
            {
              model: Location,
              include: [
                {
                  model: Contact,
                  attributes: ["firstName", "lastName"],
                },
              ],
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
          order: [[Location, 'id', 'DESC']], 
        });

        if (!contact) {
            return sendResponse(res, 404, null, "Contact not found");
        }

        // Step 2: Fetch Quotes Separately (Avoids Deep Joins)
        const quotes = await Quote.findAll({ where: { proposalSubmittedTo: id } });

        // Step 3: Fetch Quote-Related Data in Parallel (Faster)
        const quoteDetails = await Promise.all(
            quotes.map(async (quote:any) => {
                const [
                    measurements,
                    finishingChoices,
                    customStains,
                    addOns,
                    installations,
                    additionalWorks,
                    areaImages,
                    quoteVendorPricings,
                    contract,
                ] = await Promise.all([
                    Measurement.findAll({ where: { quoteId: quote.id } }),
                    FinishingChoices.findAll({ where: { quoteId: quote.id } }),
                    CustomStain.findAll({ where: { quoteId: quote.id } }),
                    AddOn.findAll({ where: { quoteId: quote.id } }),
                    Installations.findAll({ where: { quoteId: quote.id } }),
                    AdditionalWork.findAll({ where: { quoteId: quote.id } }),
                    AreaImages.findAll({ where: { quoteId: quote.id } }),
                    QuoteVendorPricing.findAll({ where: { quoteId: quote.id } }),
                    Contract.findOne({ where: { quoteId: quote.id } }),
                ]);

                return {
                    ...quote.get(),
                    Measurements: measurements.map((m) => m.get()),
                    FinishingChoices: finishingChoices.map((f) => f.get()),
                    CustomStains: customStains.map((c) => c.get()),
                    AddOns: addOns.map((a) => a.get()),
                    Installations: installations.map((i) => i.get()),
                    AdditionalWorks: additionalWorks.map((aw) => aw.get()),
                    AreaImages: areaImages.map((ai) => ai.get()),
                    QuoteVendorPricings: quoteVendorPricings.map((qvp) => qvp.get()),
                    Contract: contract ? contract.get() : null,
                };
            })
        );

        // Step 4: Merge Data and Send Response
        const contactData = {
            ...contact.get(),
            Quotes: quoteDetails,
        };

        console.log("Contact with Quotes fetched successfully");

        return sendResponse(res, 200, contactData, "Contact found");
    } catch (error) {
        console.error("Error while fetching contact", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the contact");
    }
};