import Link from "next/link";
import Name from "../name";

function getAdminPanelUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL || "https://localhost:3001";
}

export default function Navbar() {

  return (
    <div className="navbar bg-base-100 shadow-sm">
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
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </div>
        <Link href={"/"} className="btn btn-ghost logo">
          <Name />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <Link href={getAdminPanelUrl()} className="btn">
          Customer Dashboard
        </Link>
      </div>
    </div>
  );
}
