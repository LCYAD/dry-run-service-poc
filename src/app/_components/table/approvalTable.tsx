"use client";

import { api } from "@/trpc/react";
import { useContext } from "react";
import { NotificationContext } from "@/app/_context/notificationContext";
import TableContainer from "./tableContainer";
import TableHeader from "./tableHeader";
import DeleteBtn from "./deleteBtn";
import CustomBtn from "./customBtn";

type Props = {
  userRole: string;
};

export default function ApprovalTable({ userRole }: Props) {
  const { data: approvals = [], isLoading } = api.approval.getAll.useQuery();
  const { setNotification } = useContext(NotificationContext);

  const utils = api.useUtils();

  const deleteApproval = api.approval.delete.useMutation({
    onSuccess: async () => {
      await utils.approval.getAll.invalidate();
      setNotification({
        type: "success",
        text: "Approval deleted successfully!",
        isVisible: true,
      });
    },
  });

  const deletApprovalHandler = (id: number) => () => {
    deleteApproval.mutate({ id });
  };

  const approvalUpdateStatus = api.approval.updateStatus.useMutation({
    onSuccess: async (_, { status }) => {
      await Promise.all([
        utils.failedJob.getAll.invalidate(),
        utils.approval.getAll.invalidate(),
        utils.auditLog.getAll.invalidate(),
      ]);
      setNotification({
        type: status === "approved" ? "success" : "error",
        text:
          status === "approved"
            ? "Request approved successfully"
            : "Request was rejected",
        isVisible: true,
      });
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
