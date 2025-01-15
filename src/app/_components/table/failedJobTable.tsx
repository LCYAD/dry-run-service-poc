"use client";

import { api } from "@/trpc/react";
import { useContext } from "react";
import { NotificationContext } from "@/app/_context/notificationContext";
import DeleteBtn from "./deleteBtn";
import TableContainer from "./tableContainer";
import RequestApprovalBtn from "./customBtn";
import TableHeader from "./tableHeader";
import UploadKeyInput from "../uploadKeyInput";

export default function FailedJobTable() {
  const { data: failedJobs = [], isLoading } = api.failedJob.getAll.useQuery();
  const { setNotification } = useContext(NotificationContext);

  const utils = api.useUtils();
  const deleteFailJob = api.failedJob.delete.useMutation({
    onSuccess: async (result) => {
      await Promise.all([
        utils.failedJob.getAll.invalidate(),
        utils.approval.getAll.invalidate(),
      ]);
      setNotification({
        type: "success",
        text: "Failed Job deleted successfully!",
        isVisible: true,
      });
      localStorage.removeItem(`pkey-${result.jobId}`);
    },
  });

  const deletFailJobHandler = (id: number) => () => {
    deleteFailJob.mutate({ id });
  };

  const createApproval = api.approval.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.approval.getAll.invalidate(),
        utils.auditLog.getAll.invalidate(),
      ]);
      setNotification({
        type: "success",
        text: "Approval was created successfully!",
        isVisible: true,
      });
    },
    onError: (err) => {
      setNotification({
        type: "error",
        text: err.message,
        isVisible: true,
      });
    },
  });

  const createApprovalHandler = (jobId: number) => () => {
    createApproval.mutate({ jobId });
  };

  const tableHeaders = [
    { name: "Job Name", widthPercentageStr: "14%" },
    { name: "Job ID", widthPercentageStr: "15%" },
    { name: "Approved", widthPercentageStr: "8%" },
    { name: "Created At", widthPercentageStr: "14%" },
    { name: "Last Updated", widthPercentageStr: "14%" },
    { name: "Action", widthPercentageStr: "35%" },
  ];

  return (
    <TableContainer title="Failed Jobs">
      <table className="table table-zebra w-full border-2 border-gray-400">
        <TableHeader headers={tableHeaders} />
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={tableHeaders.length} className="h-24 text-center">
                <span className="loading loading-spinner loading-lg"></span>
              </td>
            </tr>
          ) : (
            failedJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.jobName}</td>
                <td>{job.jobId}</td>
                <td>{job.downloadApproved ? "Yes" : "No"}</td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>
                <td>
                  {job.updatedAt
                    ? new Date(job.updatedAt).toLocaleString()
                    : new Date(job.createdAt).toLocaleString()}
                </td>
                <td>
                  <div className="flex w-full">
                    <DeleteBtn clickHandler={deletFailJobHandler(job.id)} />
                    {job.downloadApproved ? (
                      <UploadKeyInput id={job.id} jobId={job.jobId} />
                    ) : (
                      <RequestApprovalBtn
                        clickHandler={createApprovalHandler(job.id)}
                        text="Request Approval"
                        disabled={job.downloadApproved!}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  );
}
