/*
// create a new file called authorizedUsers.ts and pass the following code in it to block unauthorized users from accessing your app
// the email should correspond to the email (currently only Google account) you are using to login
import { QUEUE_NAMES } from "@/server/bullmq/constant";

export type UserRole = "admin" | "approver" | "developer";

export type UserAccessRights = {
  role: UserRole;
  accessibleJobs: string[];
};

export const authorizedUsers: Record<string, UserAccessRights> = {
  "abc@def.com": {
    role: "approver",
    accessibleJobs: ["xyz"],
  },
};
*/
