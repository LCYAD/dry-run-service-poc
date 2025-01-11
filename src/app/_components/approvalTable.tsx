"use client";

import { api } from "@/trpc/react";
import TableContainer from "./tableContainer";

export default function ApprovalTable() {
  const { data: approvals = [] } = api.approval.getApprovals.useQuery();
  return (
    <TableContainer title="Approvals">
      <table className="table table-zebra w-[80%] border-2 border-gray-400">
        <thead>
          <tr>
            <th className="text-base">Job ID</th>
            <th className="text-base">User Email</th>
            <th className="text-base">Status</th>
            <th className="text-base">Created At</th>
            <th className="text-base">Last Updated</th>
            <th className="text-base">Action</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((approval) => (
            <tr key={approval.id}>
              <td>{approval.jobId}</td>
              <td>{approval.userEmail}</td>
              <td>{approval.status ? "Yes" : "No"}</td>
              <td>{new Date(approval.createdAt).toLocaleString()}</td>
              <td>
                {approval.updatedAt
                  ? new Date(approval.updatedAt).toLocaleString()
                  : new Date(approval.createdAt).toLocaleString()}
              </td>
              <td>
                {/* TODO: add action buttons and hide some function if user is developer */}
                <span>test</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
}
