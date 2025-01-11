"use client";

import Image from "next/image";
import { api } from "@/trpc/react";

type Props = {
  jobId: number;
};

export default function RequestApprovalBtn({ jobId }: Props) {
  const utils = api.useUtils();
  const createApproval = api.approval.create.useMutation({
    onSuccess: () => {
      utils.approval.getApprovals.invalidate();
    },
  });
  return (
    <button
      onClick={async () => {
        await createApproval.mutate({ jobId });
      }}
      className="btn mx-1 w-24"
    >
      Request Approval
    </button>
  );
}
