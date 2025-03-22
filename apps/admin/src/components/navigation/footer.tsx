import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Footer() {
  function getHomeUrl() {
    return process.env.WEB_PUBLIC_URL || "https://localhost:3000";
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full footer sm:footer-horizontal footer-center bg-base-200 p-4">
      <aside>
        <div className="justify-between flex flex-row gap-4">
          <Link href={`${getHomeUrl()}`}>Gigabit.Host</Link>
          <Link href={`${getHomeUrl()}/tos`}>Terms of Service</Link>
          <Link href={`${getHomeUrl()}/aup`}>Acceptable Use Policy</Link>
          <Link href={`${getHomeUrl()}/privacy`}>Privacy Policy</Link>
        </div>
        <div className="">
          Copyright <FontAwesomeIcon icon={faCopyright} />{" "}
          {new Date().getFullYear()} - All rights reserved by Andromeda
          Industries
        </div>
      </aside>
    </footer>
  );
}
