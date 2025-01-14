import { env } from "@/env";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  endpoint: env.S3_URL,
  region: env.S3_REGION,
  credentials: {
    accessKeyId: env.S3_ACCEESS_ID,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: env.NODE_ENV === "development", // true value Required for MinIO
});

export const uploadToS3 = async (
  bucketName: string,
  key: string,
  data: Buffer | string,
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: data,
    ContentType: "application/json",
  });

  try {
    const response = await s3Client.send(command);
    return {
      success: true,
      response,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const downloadAndDecryptFromS3 = async (
  bucketName: string,
  key: string,
  privateKey: string,
) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const encryptedBuffer = await response.Body?.transformToByteArray();

    if (!encryptedBuffer)
      return {
        success: false,
        error: "No data found",
      };

    const decryptedData = crypto.privateDecrypt(
      privateKey,
      Buffer.from(encryptedBuffer),
    );

    const jsonData = JSON.parse(decryptedData.toString()) as Record<
      string,
      unknown
    >;

    return {
      success: true,
      data: jsonData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const deleteS3Object = async (bucketName: string, key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    return {
      success: true,
      response,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
