import { requestHandler } from "../utils/helper.utils";

export const handler = requestHandler(async () => {
  console.log("Logging hello world to stdout");

  return {
    statusCode: 200,
    body: { message: "Hello. The API is running ok." },
  };
});
