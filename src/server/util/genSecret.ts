import crypto from "crypto";

// Generate a key pair for encryption
export const generateKeyPair = (
  modulusLength: number,
): crypto.KeyPairSyncResult<string, string> => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
};
