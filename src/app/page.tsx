import { auth } from "@/server/auth";
import ApprovalTable from "./_components/table/approvalTable";
import AuthenticatedLayout from "./_components/authenticatedLayout";
import FailedJobTable from "./_components/table/failedJobTable";

export default async function Home() {
  const session = await auth();
  const userRole = session?.user?.role ?? "";
  return (
    <AuthenticatedLayout>
      {userRole !== "approver" && <FailedJobTable />}
      <ApprovalTable userRole={userRole} />
    </AuthenticatedLayout>
  );
}
