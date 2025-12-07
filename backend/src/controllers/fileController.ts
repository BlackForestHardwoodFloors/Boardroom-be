import { Request, RequestHandler, Response } from "express";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
import { Express } from "express";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // EC2 IAM role will be used automatically
});

export const uploadFilesToS3 : RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const files = req.files as Express.Multer.File[];
    console.log("🚀 ~ uploadFilesToS3 ~ files:", files)
    const folder: string[] = req.body.folder|| '';

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "At least one file is required." });
    }
    
    const uploadedUrls: string[] = [];
    console.log("🚀 ~ uploadFilesToS3 ~ uploadedUrls:", uploadedUrls)

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `${folder}/${Date.now()}-${file.originalname}`;

      console.log("🚀 ~ uploadFilesToS3 ~ fileKey:", fileKey)
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      uploadedUrls.push(url);
    }

    return res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ error: "File upload failed." });
  }
};

export const deleteFileFromS3 = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "fileUrl is required." });
    }

    const fileKey = fileUrl.split(".amazonaws.com/")[1];

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    });

    await s3Client.send(command);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ error: "File deletion failed." });
  }
};
