import { type ChangeEvent, useContext, useState } from "react";
import CustomBtn from "./table/customBtn";
import { NotificationContext } from "../_context/notificationContext";

type Props = {
  id: number;
  jobId: string;
};

export default function UploadKeyInput({ id, jobId }: Props) {
  const [uploadedKey, setUploadedKey] = useState(false);
  const { setNotification } = useContext(NotificationContext);

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
      // handle download action
      console.log(keyContent);
    }
  };

  const handleRetry = (id: number, jobId: string) => () => {
    const keyContent = localStorage.getItem(`pkey-${jobId}`);
    if (keyContent) {
      // handle download action
      console.log(keyContent);
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
