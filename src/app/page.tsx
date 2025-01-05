import { auth } from "@/server/auth";
import ApprovalTable from "./_components/approvalTable";
import AuthenticatedLayout from "./_components/authenticatedLayout";
import ErrorTable from "./_components/errorTable";

export default async function Home() {
  const session = await auth();
  const userRole = session?.user?.role ?? "";
  return (
    <AuthenticatedLayout>
      {userRole !== "approver" && <ErrorTable />}
      <ApprovalTable />
    </AuthenticatedLayout>
  );
}
