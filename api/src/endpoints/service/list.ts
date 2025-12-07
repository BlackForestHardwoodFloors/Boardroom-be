/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { initialize } from "../../../../database/src/data-source";
import { requestHandler } from "../../utils/helper.utils";
import { listService } from "../../../../database/src/operations/service/listService";


export const handler = requestHandler(async (event) => {
  await initialize();
  try {
    const Service = await listService();
    const result = Service.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      categoryId: item.categoryId,
      category: item.category.name,
      status: item.status,
      createdAt: item.createdTime,
      createdBy: `${item.createdByUser.first_name} ${item.createdByUser.last_name}`
    }));
    console.log(result)
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error: any) {
    console.log("Error while listing Service: ", error);
    return {
      statusCode: 404,
      body: error.message,
    };
  }
});

const mockEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/admin/vendor/account/list',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: ''
};

handler(mockEvent, {} as any, {} as any);