"use client";

import { api } from "@/trpc/react";
import TableContainer from "../../_components/table/tableContainer";
import TableHeader from "../../_components/table/tableHeader";
import DeleteBtn from "../../_components/table/deleteBtn";

export default function AuditLogTable() {
  const { data: auditLogs = [], isLoading } = api.auditLog.getAll.useQuery();

  const utils = api.useUtils();
  const deleteAuditLog = api.auditLog.delete.useMutation({
    onSuccess: async () => {
      await utils.auditLog.getAll.invalidate();
    },
  });

  const deletAuditLogHandler = (id: number) => () => {
    deleteAuditLog.mutate({ id });
  };

  const tableHeaders = [
    { name: "Job ID", widthPercentageStr: "10%" },
    { name: "Event", widthPercentageStr: "15%" },
    { name: "Performed By", widthPercentageStr: "15%" },
    { name: "Created At", widthPercentageStr: "15%" },
    { name: "Last Updated", widthPercentageStr: "15%" },
    { name: "Action", widthPercentageStr: "20%" },
  ];

  return (
    <TableContainer title="Audit Logs">
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
            auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.jobId}</td>
                <td>{log.event}</td>
                <td>{log.performedBy}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  {log.updatedAt
                    ? new Date(log.updatedAt).toLocaleString()
                    : new Date(log.createdAt).toLocaleString()}
                </td>
                <td>
                  <DeleteBtn clickHandler={deletAuditLogHandler(log.id)} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  );
}
