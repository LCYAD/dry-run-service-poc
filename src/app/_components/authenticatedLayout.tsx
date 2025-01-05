import { type ReactNode } from "react";
import NavBar from "./navBar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient } from "@/trpc/server";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <NavBar session={session} />
      <div className="min-h-[90vh]">{children}</div>
    </HydrateClient>
  );
}
