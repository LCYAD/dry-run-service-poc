"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./signOutButton";
import type { Session } from "next-auth";

type Props = {
  session: Session;
};

const pathNameMapping: Record<string, string> = {
  "/": "Dashboard",
  "/audit-log": "Audit Logs",
};

export default function NavBar({ session }: Props) {
  const pathname = usePathname();
  const navBarName = pathNameMapping[pathname] ?? "";

  return (
    <div className="navbar bg-base-100 py-4">
      <div className="navbar-start">
        {session.user.role === "admin" && (
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-lg z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <Link href={pathname === "/audit-log" ? "/" : "/audit-log"}>
                  {pathname === "/audit-log" ? "Dashboard" : "Audit Logs"}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="navbar-center">
        <span className="text-xl font-bold">{navBarName}</span>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end px-3">
          <div
            tabIndex={0}
            role="button"
            className="avatar btn btn-circle btn-ghost"
          >
            <div className="w-10 rounded-full">
              <Image
                alt="Tailwind CSS Navbar component"
                src={
                  session?.user?.image?.includes("googleusercontent.com")
                    ? session.user.image
                    : "emptyAvatar.svg"
                }
                width={50}
                height={50}
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content menu-lg z-[1] mt-1 w-36 rounded-box bg-base-100 p-2 shadow"
          >
            <li>
              <SignOutButton />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
