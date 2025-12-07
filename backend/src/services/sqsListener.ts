import dotenv from "dotenv";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { broadcastMessage } from "./websocketService";
import { Message } from "../models/Message";

dotenv.config();

const sqsClient = new SQSClient({
  region: process.env.AWS_SQS_REGION,
});

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;
export class SQSListener {
  private isRunning = false;
  private baseDelay = 1000; // 1s minimum delay between polls
  private maxDelay = 30000; // 30s max delay (when idle or failing)
  private currentDelay = this.baseDelay;

  async startListening() {
    this.isRunning = true;
    console.log("Started SQS listener...");

    while (this.isRunning) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 30, // 30 seconds to process message
        });

        const data = await sqsClient.send(command);

        if (data.Messages && data.Messages.length > 0) {
          console.log(`Received ${data.Messages.length} message(s)`);
          await Promise.all(data.Messages.map((m) => this.handleMessage(m)));
          this.currentDelay = this.baseDelay;
        } else {
          // console.log("No messages, slowing down...");
          this.currentDelay = Math.min(this.currentDelay * 2, this.maxDelay);
        }
      } catch (err) {
        console.error("Error polling SQS:", err);
        this.currentDelay = Math.min(this.currentDelay * 2, this.maxDelay);
      }

      await this.delay(this.currentDelay);
    }

    console.log("Stopped SQS listener...");
  }

  private async handleMessage(message: any) {
    try {
      let messageContent;

      try {
        messageContent = JSON.parse(message.Body ?? "{}");
      } catch {
        messageContent = {
          Message: message.Body,
          messageId: message.MessageId,
          originationNumber: "UNKNOWN",
          messageBody: message.Body,
          destinationNumber:
            process.env.AWS_SNS_ORIGINATION_NUMBER || "UNKNOWN",
        };
      }

      const incomingMessage =
        messageContent.Message ||
        messageContent.messageBody ||
        message.Body;

      const messageId = messageContent.messageId || message.MessageId;
      const timestamp = new Date().toISOString();

      try {
        await Message.create({
          messageId,
          phoneNumber: messageContent.originationNumber || "UNKNOWN",
          message: incomingMessage,
          direction: "inbound",
          status: "received",
          timestamp,
          originationNumber:
            messageContent.destinationNumber ||
            process.env.AWS_SNS_ORIGINATION_NUMBER ||
            "UNKNOWN",
        });
      } catch (err: any) {
        if (err.name === "SequelizeUniqueConstraintError" || err.code === 'ER_DUP_ENTRY') {
          console.log("Duplicate message skipped:", messageId);
        } else {
          throw err;
        }
      }

      // Delete from SQS
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle!,
        })
      );

      // Broadcast via WebSocket
      broadcastMessage({
        messageId,
        phoneNumber: messageContent.originationNumber,
        message: incomingMessage,
        direction: "inbound",
        status: "received",
        timestamp,
      });

      console.log("Processed and stored message:", messageId);
    } catch (err) {
      console.error("Failed to handle message:", err);
    }
  }

  stop() {
    this.isRunning = false;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
