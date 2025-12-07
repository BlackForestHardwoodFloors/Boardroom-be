import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
  "Access-Control-Allow-Methods": "*", // Required for CORS support to work
  "Access-Control-Allow-Headers":
    "Authorization,Cache-Control,Content-Type,X-Api-Key", // Required for CORS with Authorization and X-Api-Key
  "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
};

type ApiResponse = {
  statusCode?: number;
  body: unknown;
  headers?: Record<string, unknown>;
};

function formatResponse(response: ApiResponse): APIGatewayProxyResult {
  return {
    statusCode: response.statusCode ?? 200,
    body: JSON.stringify(response.body),
    headers: { ...DEFAULT_HEADERS, ...(response.headers || {}) },
  };
}

export function requestHandler(
  handler: (event: APIGatewayProxyEvent) => Promise<ApiResponse>,
): APIGatewayProxyHandler {
  return async (event) => {
    try {
      return formatResponse(await handler(event));
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        return formatResponse({
          statusCode: 500,
          body: { error: error.message },
        });
      }
      return formatResponse({
        statusCode: 500,
        body: { error: "Unknown error" },
      });
    }
  };
}
