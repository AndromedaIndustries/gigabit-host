import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Footer() {
  const company = process.env.NEXT_PUBLIC_SITE_COMPANY

  return (
    <footer className="fixed bottom-0 left-0 w-full footer sm:footer-horizontal footer-center bg-base-200 p-4">
      <aside>
        <div className="justify-between flex flex-row gap-4">
          <Link href={"/tos"}>Terms of Service</Link>
          <Link href={"/aup"}>Acceptable Use Policy</Link>
          <Link href={"/privacy"}>Privacy Policy</Link>
        </div>
        <div className="">
          Copyright <FontAwesomeIcon icon={faCopyright} />{" "}
          {new Date().getFullYear()} - All rights reserved by {company}
        </div>
      </aside>
    </footer>
  );
}
