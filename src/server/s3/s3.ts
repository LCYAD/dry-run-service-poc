import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "http://localhost:9000", // MinIO local endpoint
  region: "us-east-1", // Can be any region for MinIO
  credentials: {
    accessKeyId: "minioadmin", // Default MinIO access key
    secretAccessKey: "minioadmin", // Default MinIO secret key
  },
  forcePathStyle: true, // Required for MinIO
});

const bucketName = "error-data";

export const uploadJsonToS3 = async (
  key: string,
  jsonData: Record<string, unknown>,
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(jsonData),
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

export { s3Client };
