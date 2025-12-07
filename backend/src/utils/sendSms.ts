import { PinpointSMSVoiceV2Client, SendTextMessageCommand, MessageType } from "@aws-sdk/client-pinpoint-sms-voice-v2";

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  requestId?: string;
  error?: string;
}

const client = new PinpointSMSVoiceV2Client({
  region: process.env.AWS_SNS_REGION,
  // No credentials needed if IAM role is used
});

export async function sendSms({ phoneNumber, message }: { phoneNumber: string, message: string }): Promise<SendSmsResult | null> {
  try {
    const input = {
      DestinationPhoneNumber: phoneNumber,
      OriginationIdentity: process.env.AWS_PHONE_POOL_ID,
      MessageBody: message,
      MessageType: MessageType.TRANSACTIONAL,
      MessageFeedbackEnabled: true,
    };

    const command = new SendTextMessageCommand(input);
    const response = await client.send(command);

    return {
      success: true,
      messageId: response.MessageId,
      requestId: response.$metadata?.requestId,
    };
  } catch (err) {
    console.error("Failed to send SMS:", err);
    return {
      success: false,
      messageId: null,
      error: err.message || "Unknown error occurred",
      requestId: err.$metadata?.requestId,
    };
  }
}
