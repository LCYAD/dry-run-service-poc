"use client";

import { api } from "@/trpc/react";
import TableContainer from "./tableContainer";
import TableHeader from "./tableHeader";
import DeleteBtn from "./deleteBtn";
import CustomBtn from "./customBtn";
import type { Session } from "next-auth";

type Props = {
  userRole: string;
};

export default function ApprovalTable({ userRole }: Props) {
  const { data: approvals = [], isLoading } = api.approval.getAll.useQuery();

  const utils = api.useUtils();
  const deleteApproval = api.approval.delete.useMutation({
    onSuccess: () => {
      utils.approval.getAll.invalidate();
    },
  });

  const deletApprovalHandler = (id: number) => () => {
    deleteApproval.mutate({ id });
  };

  const approvalUpdateStatus = api.approval.updateStatus.useMutation({
    onSuccess: () => {
      utils.failedJob.getAll.invalidate();
      utils.approval.getAll.invalidate();
    },
  });

  const approvalUpdateStatusHandler =
    (id: number, status: "approved" | "rejected") => () => {
      approvalUpdateStatus.mutate({ id, status });
    };

  const tableHeaders = [
    { name: "Job ID", widthPercentageStr: "17%" },
    { name: "User Email", widthPercentageStr: "20%" },
    { name: "Status", widthPercentageStr: "8%" },
    { name: "Created At", widthPercentageStr: "15%" },
    { name: "Last Updated", widthPercentageStr: "15%" },
    { name: "Action", widthPercentageStr: "25%" },
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
                <td>{approval.status}</td>
                <td>{new Date(approval.createdAt).toLocaleString()}</td>
                <td>
                  {approval.updatedAt
                    ? new Date(approval.updatedAt).toLocaleString()
                    : new Date(approval.createdAt).toLocaleString()}
                </td>
                <td>
                  <div className="flex w-full">
                    {userRole !== "developer" && (
                      <>
                        <CustomBtn
                          clickHandler={approvalUpdateStatusHandler(
                            approval.id,
                            "approved",
                          )}
                          disabled={approval.status !== "pending"}
                          text="Approve"
                        />
                        <CustomBtn
                          clickHandler={approvalUpdateStatusHandler(
                            approval.id,
                            "rejected",
                          )}
                          disabled={approval.status !== "pending"}
                          text="Reject"
                        />
                      </>
                    )}
                    <DeleteBtn
                      clickHandler={deletApprovalHandler(approval.id)}
                    />
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
