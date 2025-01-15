"use client";

import { type ChangeEvent, useContext, useEffect, useState } from "react";
import { api } from "@/trpc/react";
import CustomBtn from "./table/customBtn";
import { NotificationContext } from "../_context/notificationContext";

type Props = {
  id: number;
  jobId: string;
};

export default function UploadKeyInput({ id, jobId }: Props) {
  const [uploadedKey, setUploadedKey] = useState(false);
  const { setNotification } = useContext(NotificationContext);
  const utils = api.useUtils();

  useEffect(() => {
    const keyContent = localStorage.getItem(`pkey-${jobId}`);
    if (keyContent) {
      setUploadedKey(true);
    }
  }, [jobId]);

  const downloadFileMutation = api.failedJob.download.useMutation({
    onSuccess: (result) => {
      setNotification({
        type: "success",
        text: "File Download Successful!",
        isVisible: true,
      });
      const blob = new Blob([JSON.stringify(result)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${jobId}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      setNotification({
        type: "error",
        text: `Failed to download: ${error.message}`,
        isVisible: true,
      });
    },
  });

  const retryFailedJobMutation = api.failedJob.retry.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.failedJob.getAll.invalidate(),
        utils.approval.getAll.invalidate(),
      ]);
      setNotification({
        type: "success",
        text: "Job was scheduled for retries",
        isVisible: true,
      });
      localStorage.removeItem(`pkey-${jobId}`);
    },
    onError: (error) => {
      setNotification({
        type: "error",
        text: `Failed to retry job: ${error.message}`,
        isVisible: true,
      });
    },
  });

  const handleFileUpload =
    (jobId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Read file as text and store in localStorage
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;
          localStorage.setItem(`pkey-${jobId}`, fileContent);
        };
        reader.readAsText(file);

        setUploadedKey(true);
        setNotification({
          type: "success",
          text: "Uploaded private key",
          isVisible: true,
        });
      }
    };

  const handleDownload = (id: number, jobId: string) => () => {
    const keyContent = localStorage.getItem(`pkey-${jobId}`);
    if (keyContent) {
      downloadFileMutation.mutate({
        id,
        pKeyfile: new TextEncoder().encode(keyContent),
      });
    }
  };

  const handleRetry = (id: number, jobId: string) => () => {
    const keyContent = localStorage.getItem(`pkey-${jobId}`);
    if (keyContent) {
      retryFailedJobMutation.mutate({
        id,
        pKeyfile: new TextEncoder().encode(keyContent),
      });
    }
  };

  const handleDeletePKey = (jobId: string) => () => {
    localStorage.removeItem(`pkey-${jobId}`);
    setNotification({
      type: "success",
      text: "Removed private key",
      isVisible: true,
    });
    setUploadedKey(false);
  };

  return (
    <div className="ml-2 flex gap-2">
      {uploadedKey ? (
        <>
          <CustomBtn clickHandler={handleDownload(id, jobId)} text="Download" />
          <CustomBtn clickHandler={handleRetry(id, jobId)} text="Retry" />
          <CustomBtn clickHandler={handleDeletePKey(jobId)} text="Delete Key" />
        </>
      ) : (
        <input
          type="file"
          className="file-input file-input-bordered file-input-sm my-2 w-64 max-w-xs"
          onChange={handleFileUpload(jobId)}
        />
      )}
    </div>
  );
}
