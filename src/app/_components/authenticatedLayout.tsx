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
      <NavBar userSession={session} />
      <div className="min-h-full min-w-full">{children}</div>
    </HydrateClient>
  );
}
