import { env } from "@/env";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { Readable } from "stream";
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

const bucketName = "failed-job-data";

export const encryptAndUploadJsonToS3 = async (
  key: string,
  jsonData: Record<string, unknown>,
  publicKey: string,
) => {
  // Encrypt the data
  const encryptedData = crypto.publicEncrypt(
    publicKey,
    Buffer.from(JSON.stringify(jsonData)),
  );

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: encryptedData,
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
  key: string,
  privateKey: string,
) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const encryptedBuffer = await response?.Body?.transformToByteArray();

    if (!encryptedBuffer)
      return {
        success: false,
        error: "No data found",
      };

    // Decrypt the data using private key
    const decryptedData = crypto.privateDecrypt(privateKey, encryptedBuffer);

    return {
      success: true,
      data: JSON.parse(decryptedData.toString()) as Record<string, unknown>,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
