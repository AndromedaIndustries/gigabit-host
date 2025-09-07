import Link from "next/link";
import Name from "../name";
import { createClient } from "@/utils/supabase/server";
import Logout from "@/utils/supabase/logout";

export default async function Navbar() {
  const supabase = await createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  const first_name = user?.user_metadata.first_name || null

  return (
    <div className="navbar bg-base-300 shadow-sm fixed z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <button
            tabIndex={0}
            type="button"
            className="btn btn-ghost lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Dropdown Button</title>{" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </button>
        </div>
        <Link href={"/dashboard"} className="btn btn-ghost logo">
          <Name />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
      </div>
      <div className="navbar-end">
        {(userResponse.data.user != null) ? (
          <div className="flex-row flex items-center">
            {(first_name != null) ? (
              <div>Welcome, {first_name}</div>
            ) : (
              <div>Welcome, {userResponse.data.user.email}</div>
            )}           <button
              type="button"
              className="btn btn-ghost"
              onClick={Logout}
            >
              Sign Out
            </button>

          </div>
        ) : null}
      </div>
    </div >
  );
}
