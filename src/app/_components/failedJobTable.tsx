"use client";

import { api } from "@/trpc/react";
import DeleteBtn from "./deleteBtn";
import TableContainer from "./tableContainer";
import RequestApprovalBtn from "./requestApprovalBtn";
import TableHeader from "./tableHeader";

export default function FailedJobTable() {
  const { data: failedJobs = [], isLoading } = api.failedJob.getAll.useQuery();

  const utils = api.useUtils();
  const deleteFailJob = api.failedJob.delete.useMutation({
    onSuccess: () => {
      // TODO: invalidate only the ones being deleted
      utils.failedJob.getAll.invalidate();
      utils.approval.getAll.invalidate();
    },
  });

  const deletFailJobHandler = (id: number) => () => {
    deleteFailJob.mutate({ id });
  };

  const tableHeaders = [
    "Job Name",
    "Job ID",
    "Approved",
    "Created At",
    "Last Updated",
    "Action",
  ];

  return (
    <TableContainer title="Failed Jobs">
      <table className="table table-zebra w-[80%] border-2 border-gray-400">
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
                    <RequestApprovalBtn jobId={job.id} />
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
