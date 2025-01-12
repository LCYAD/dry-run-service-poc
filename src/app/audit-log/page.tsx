import { auth } from "@/server/auth";
import AuthenticatedLayout from "../_components/authenticatedLayout";
import AuditLogTable from "./_components/auditLogTable";

export default async function AuditLogPage() {
  return (
    <AuthenticatedLayout allowedRoles={["admin"]}>
      <AuditLogTable />
    </AuthenticatedLayout>
  );
}
