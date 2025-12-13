// src/services/photoStorage.ts

import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const REGION = process.env.AWS_REGION || "us-west-2";
const BUCKET = process.env.PHOTO_BUCKET || "blackforest-dev-assets";

const s3 = new S3({ region: REGION });

export async function uploadPhotoToS3(params: {
  fileBuffer: Buffer;
  mimeType: string;
  originalName: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const { fileBuffer, mimeType, originalName, metadata = {} } = params;

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const key = `photos/${timestamp}-${randomId}-${originalName}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: metadata,
    },
  });

  await upload.done();

  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}
