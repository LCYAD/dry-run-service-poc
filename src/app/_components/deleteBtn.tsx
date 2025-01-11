"use client";

import Image from "next/image";
import { api } from "@/trpc/react";

type Props = {
  id: number;
};

export default function DeleteBtn({ id }: Props) {
  const utils = api.useUtils();
  const deleteFailJob = api.failedJob.deleteJob.useMutation({
    onSuccess: () => {
      utils.failedJob.getFailJobs.invalidate();
    },
  });
  return (
    <button
      onClick={async () => {
        await deleteFailJob.mutate({ id });
      }}
      className="btn mx-1"
    >
      <Image src="trashCan.svg" width={30} height={30} alt="delete" />
    </button>
  );
}
