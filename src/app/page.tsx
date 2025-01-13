import { auth } from "@/server/auth";
import ApprovalTable from "./_components/table/approvalTable";
import AuthenticatedLayout from "./_components/authenticatedLayout";
import FailedJobTable from "./_components/table/failedJobTable";
import NotificationBar from "./_components/notificationBar";
import { NotificationProvider } from "./_context/notificationContext";

export default async function Home() {
  const session = await auth();
  const userRole = session?.user?.role ?? "";

  return (
    <AuthenticatedLayout>
      <NotificationProvider>
        <div className="flex h-24 w-full items-center justify-center">
          <NotificationBar />
        </div>
        {userRole !== "approver" && <FailedJobTable />}
        <ApprovalTable userRole={userRole} />
      </NotificationProvider>
    </AuthenticatedLayout>
  );
}
