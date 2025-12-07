// emailService.ts
import { Request, RequestHandler, Response } from "express";
import { sendResponse } from "../utils/response";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import {
  SESv2Client,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-sesv2";

dotenv.config();

const sesClient = new SESv2Client({
  region: process.env.AWS_SES_REGION || "us-west-2",
});

export const sendEmailUtil = async ({
  to,
  subject,
  html,
  mailType
}: {
  to: string;
  subject: string;
  html: string;
  mailType?: string;
}) => {
  let fromEmail = process.env.AWS_SES_FROM_EMAIL;
  let ccAddress = null;
  if (mailType === "contract") {
    ccAddress = fromEmail;
    fromEmail = "contracts@blackforestfloors.com";
  } else if (mailType === "quote") {
    ccAddress = fromEmail;
    fromEmail = "quotes@blackforestfloors.com";
  }
  const params: SendEmailCommandInput = {
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: [to],
      ...(ccAddress && { CcAddresses: [ccAddress] }),
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  await sesClient.send(command);
};

export const sendEmailHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { to, subject, message , mailType } = req.body;

  try {
    await sendEmailUtil({ to, subject, html: message ,mailType});
    sendResponse(res, 201, null, "Email sent successfully");
  } catch (error) {
    console.error("Error while sending email", error);
    sendResponse(res, 500, error, "An error occurred while sending an email");
  }
};
