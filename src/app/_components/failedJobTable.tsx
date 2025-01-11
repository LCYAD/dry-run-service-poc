"use client";

import { api } from "@/trpc/react";
import Divider from "./divider";
import DeleteBtn from "./deleteBtn";

export default function FailedJobTable() {
  const { data: failedJobs = [] } = api.failedJob.getFailJobs.useQuery();

  return (
    <div className="m-[10%] h-[40%] w-full">
      <p className="text-2xl font-semibold">Error Monitor</p>
      <Divider />
      <div className="overflow-x-auto">
        <table className="table table-zebra w-[80%] border-2 border-gray-400">
          <thead>
            <tr>
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
                <td>{job.jobId}</td>
                <td>{job.downloadApproved ? "Yes" : "No"}</td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>
                <td>
                  {job.updatedAt
                    ? new Date(job.updatedAt).toLocaleString()
                    : new Date(job.createdAt).toLocaleString()}
                </td>
                <td>
                  <DeleteBtn id={job.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
