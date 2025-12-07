import { Request, RequestHandler, Response } from 'express';
import { sendResponse } from "../../utils/response";
import { validateFields } from '../../utils/validateFields';
import { IGetUserAuthInfoRequest } from '../../middleware/authentication';
import { VendorPrice } from '../../models/VendorPrice';
import { VendorPriceLogs } from '../../models/VendorPriceLogs';
import { VendorCompany } from '../../models/VendorCompany';
import { ScopeOfWork } from '../../models/ScopeofWork';
import { paginate } from '../../utils/paginate';
import { Op } from 'sequelize';
import { getBrandMap, getVendorCompanyMap } from '../../utils/helper';

interface VendorPriceRequestBody {
    id: string;
    material: string,
    rate: number,
    vendor: string,
    validTill: string,
    woodSpecies: string,
    grade: string,
    size: string,
    availableQuantity: string,
    updatedDate: string,
}

export const createVendorPrice: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const {
            material,
            vendor,
            rate,
            validTill,
            woodSpecies,
            grade,
            size,
            availableQuantity,
            updatedDate,
        }: VendorPriceRequestBody = req.body;

        const requiredFields = ['material', 'vendor', 'rate'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        const newVendorPrice = await VendorPrice.create({
            material,
            vendor,
            rate,
            validTill,
            woodSpecies,
            grade,
            size,
            availableQuantity,
            updatedDate,
            createdBy: req.user.firstName + " " + req.user.lastName,
            createdTime: new Date(),
            modifiedBy: req.user.firstName + " " + req.user.lastName,
            modifiedTime: new Date()
        });
        return sendResponse(res, 201, newVendorPrice, "VendorPrice created successfully");
    } catch (error) {
        console.log("Error while creating VendorPrice", error);
        return sendResponse(res, 500, null, "An error occurred while creating the VendorPrice");
    }
}

export const getVendorPrice: RequestHandler = async (req: Request, res: Response): Promise<any> => {
    try {

        const page = req.query.page ? parseInt(req.query.page as string) : null;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : null;
        const search = req.query.search ? req.query.search.toString() : null;

        const [companyMap, companyIds] = search ? await getVendorCompanyMap(search) : [{}, []];
        const [brandMap, brandIds] = search ? await getBrandMap(search) : [{}, []];

        const whereCondition: any = {
            [Op.or]: [
                { delete: { [Op.ne]: "Yes" } },
                { delete: { [Op.is]: null } }
            ]
        };
        if (search) {
            const searchableFields = ["rate", "woodSpecies", "grade", "size", "availableQuantity"];
            whereCondition[Op.and] = [
                {
                    [Op.or]: [
                        ...searchableFields.map(field => ({
                            [field]: { [Op.like]: `%${search}%` }
                        })),
                        ...(companyIds.length > 0 ? [{ vendor: { [Op.in]: companyIds } }] : []),
                        ...(brandIds.length > 0 ? [{ material: { [Op.in]: brandIds } }] : [])
                    ],
                }
            ];
        }

        const paginationOptions: any = {
            where: whereCondition,
            include: [
                { model: VendorPriceLogs }
            ],
            order: [['createdTime', 'DESC']],
        };

        let vendorPrices;
        let pagination;

        if (!page || !pageSize) {
            vendorPrices = await VendorPrice.findAll(paginationOptions);
            pagination = null; // No pagination metadata if fetching all data
        } else {
            // Apply pagination
            const result = await paginate(VendorPrice, page, pageSize, paginationOptions);
            vendorPrices = result.data;
            pagination = result.pagination;
        }
        vendorPrices = vendorPrices.map(item => ({
            ...item.toJSON(),
            companyName: companyMap[item.vendor] || null,
            brandName: brandMap[item.material] || null
        }));

        return sendResponse(res, 200, { vendorPrices, pagination }, "VendorPrices found");
    } catch (error) {
        console.log("Error while fetching VendorPrices", error);
        return sendResponse(res, 500, null, "An error occurred while fetching the VendorPrices");
    }
};

export const updateVendorPrice: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const {
            material,
            vendor,
            rate,
            validTill,
            woodSpecies,
            grade,
            size,
            availableQuantity,
            updatedDate,
        }: VendorPriceRequestBody = req.body;

        const requiredFields = ['material', 'vendor', 'rate'];
        if (!validateFields(requiredFields, req, res)) {
            return;
        }

        // Fetch existing VendorPrice
        const existingVendorPrice: any = await VendorPrice.findOne({
            where: { id },
            include: [
                { model: VendorCompany, attributes: ['id', 'companyName'] }, // Get vendor name
                { model: ScopeOfWork, attributes: ['id', 'serviceItemName'] }, // Get material name
            ],
        });

        if (!existingVendorPrice) {
            return sendResponse(res, 404, null, "VendorPrice not found");
        }

        const newMaterial: any = await ScopeOfWork.findOne({ where: { id: material }, attributes: ['serviceItemName'] });
        const newVendor: any = await VendorCompany.findOne({ where: { id: vendor }, attributes: ['companyName'] });

        const oldMaterialName = existingVendorPrice?.VendorCompany?.companyName || 'Unknown';
        const oldVendorName = existingVendorPrice?.ScopeOfWork?.serviceItemName || 'Unknown';
        const newMaterialName = newMaterial?.serviceItemName; // Ensure you get the name, not ID
        const newVendorName = newVendor?.companyName;

        let changes: string[] = [];

        // Compare each field and log changes
        if (existingVendorPrice.rate !== rate) {
            changes.push(`Price updated from ${existingVendorPrice.rate} to ${rate}`);
        }
        if (oldMaterialName !== newMaterialName) {
            changes.push(`Brand updated from ${oldMaterialName} to ${newMaterialName}`);
        }
        if (oldVendorName !== newVendorName) {
            changes.push(`Vendor updated from ${oldVendorName} to ${newVendorName}`);
        }
        if (existingVendorPrice.rate !== rate) {
            changes.push(`Price updated from ${existingVendorPrice.rate} to ${rate}`);
        }
        if (existingVendorPrice.validTill !== validTill) {
            changes.push(`Valid Till updated from ${existingVendorPrice.validTill} to ${validTill}`);
        }
        if (existingVendorPrice.woodSpecies !== woodSpecies) {
            changes.push(`Wood Species updated from ${existingVendorPrice.woodSpecies} to ${woodSpecies}`);
        }
        if (existingVendorPrice.grade !== grade) {
            changes.push(`Grade updated from ${existingVendorPrice.grade} to ${grade}`);
        }
        if (existingVendorPrice.size !== size) {
            changes.push(`Size updated from ${existingVendorPrice.size} to ${size}`);
        }
        if (existingVendorPrice.availableQuantity !== availableQuantity) {
            changes.push(`Available Quantity updated from ${existingVendorPrice.availableQuantity} to ${availableQuantity}`);
        }

        // Proceed only if there are changes
        if (changes.length > 0) {
            const description = changes.join(', ');

            // Update VendorPrice
            await VendorPrice.update(
                {
                    material,
                    vendor,
                    rate,
                    validTill,
                    woodSpecies,
                    grade,
                    size,
                    availableQuantity,
                    updatedDate,
                    modifiedBy: req.user.firstName + " " + req.user.lastName,
                    modifiedTime: new Date(),
                },
                { where: { id } }
            );

            await VendorPriceLogs.create({
                vendorPriceId: id,
                description: description, // Log all changes
                createdBy: req.user.firstName + " " + req.user.lastName,
                createdTime: new Date(),
                modifiedBy: req.user.firstName + " " + req.user.lastName,
                modifiedTime: new Date(),
            });
        }

        return sendResponse(res, 201, null, "VendorPrice updated successfully");
    } catch (error) {
        console.log("Error while updating VendorPrice", error);
        return sendResponse(res, 500, null, "An error occurred while updating the VendorPrice");
    }
};

export const deleteVendorPrice: RequestHandler = async (req: IGetUserAuthInfoRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        await VendorPrice.update(
            { delete: 'Yes' },
            { where: { id: id } }
        );
        return sendResponse(res, 201, null, "VendorPrice deleted successfully");
    } catch (error) {
        console.log("Error while deleting VendorPrice", error);
        return sendResponse(res, 500, null, "An error occurred while deleting the VendorPrice");
    }
}
