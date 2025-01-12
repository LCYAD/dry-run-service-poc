"use client";

import { api } from "@/trpc/react";
import TableContainer from "./tableContainer";
import TableHeader from "./tableHeader";
import DeleteBtn from "./deleteBtn";

export default function ApprovalTable() {
  const { data: approvals = [], isLoading } = api.approval.getAll.useQuery();

  const utils = api.useUtils();
  const deleteApproval = api.approval.delete.useMutation({
    onSuccess: () => {
      // TODO: invalidate only the ones being deleted
      utils.approval.getAll.invalidate();
    },
  });

  const deletApprovalHandler = (id: number) => () => {
    deleteApproval.mutate({ id });
  };

  const tableHeaders = [
    "Job ID",
    "User Email",
    "Status",
    "Created At",
    "Last Updated",
    "Action",
  ];

  return (
    <TableContainer title="Approvals">
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
            approvals.map((approval) => (
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
                  <DeleteBtn clickHandler={deletApprovalHandler(approval.id)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  );
}
