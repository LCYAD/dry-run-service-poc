"use client";

import { api } from "@/trpc/react";
import DeleteBtn from "./deleteBtn";
import TableContainer from "./tableContainer";
import RequestApprovalBtn from "./requestApprovalBtn";

export default function FailedJobTable() {
  const { data: failedJobs = [] } = api.failedJob.getFailJobs.useQuery();

  return (
    <TableContainer title="Failed Jobs">
      <table className="table table-zebra w-[80%] border-2 border-gray-400">
        <thead>
          <tr>
            <th className="text-base">Job Name</th>
            <th className="text-base">Job ID</th>
            <th className="text-base">Approved</th>
            <th className="text-base">Created At</th>
            <th className="text-base">Last Updated</th>
            <th className="text-base">Action</th>
          </tr>
        </thead>
        <tbody>
          {failedJobs.map((job) => (
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
                  <DeleteBtn id={job.id} />
                  <RequestApprovalBtn jobId={job.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
}
