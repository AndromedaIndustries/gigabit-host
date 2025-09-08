import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Footer() {
  const homeUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://gigabit.host";
  const company = process.env.NEXT_PUBLIC_SITE_COMPANY || "Andromeda Industries"

  return (
    <footer className="fixed bottom-0 left-0 w-full footer sm:footer-horizontal footer-center bg-base-200 p-4">
      <aside>
        <div className="justify-between flex flex-row gap-4">
          <Link href={`${homeUrl}`}>Gigabit.Host</Link>
          <Link href={`${homeUrl}/terms`}>Terms of Service</Link>
          <Link href={`${homeUrl}/aup`}>Acceptable Use Policy</Link>
          <Link href={`${homeUrl}/privacy`}>Privacy Policy</Link>
        </div>
        <div className="flex flex-row-reverse gap-2">
          <div>
            Copyright <FontAwesomeIcon icon={faCopyright} />{" "}
            {new Date().getFullYear()} - All rights reserved by {company}
          </div>
          <div className="flex gap-1.5 place-items-center">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1em" viewBox="0 0 16 10" aria-label="Trans flag" role="img" >
                <rect y="0" width="16" height="2" fill="#55D4FF" />
                <rect y="2" width="16" height="2" fill="#FF66A3" />
                <rect y="4" width="16" height="2" fill="#FFFFFF" />
                <rect y="6" width="16" height="2" fill="#FF66A3" />
                <rect y="8" width="16" height="2" fill="#55D4FF" />
              </svg>
            </div>
            <div>
              Trans rights are human rights!
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1em" viewBox="0 0 16 10" aria-label="Trans flag" role="img" >
                <rect y="0" width="16" height="2" fill="#55D4FF" />
                <rect y="2" width="16" height="2" fill="#FF66A3" />
                <rect y="4" width="16" height="2" fill="#FFFFFF" />
                <rect y="6" width="16" height="2" fill="#FF66A3" />
                <rect y="8" width="16" height="2" fill="#55D4FF" />
              </svg>
            </div>
          </div>
        </div>

      </aside>
    </footer>
  );
}
