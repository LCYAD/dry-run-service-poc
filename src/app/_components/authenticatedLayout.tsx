import { type ReactNode } from "react";
import NavBar from "./navBar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient } from "@/trpc/server";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default async function AuthenticatedLayout({
  children,
  allowedRoles = [],
}: AuthenticatedLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const userRole = session?.user?.role ?? "";

  if (allowedRoles.length !== 0 && !allowedRoles.includes(userRole)) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <NavBar session={session} />
      <div className="min-h-[90vh]">{children}</div>
    </HydrateClient>
  );
}
