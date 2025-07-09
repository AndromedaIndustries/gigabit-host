import Name from "@/components/name";
import Link from "next/link";
import { env } from "process";

export default function About() {

  const company = process.env.NEXT_PUBLIC_SITE_COMPANY || "Andromeda Industries"
  const companyUrl = process.env.NEXT_PUBLIC_SITE_COMPANY_URL || "https://www.andromedaindustries.com"

  return (
    <>
      <div className="text-primary text-center text-4xl">About Us</div>
      <div className="text-warning text-center p-5">
        Our service is a work in progress and evolving over time.
      </div>
      <div className="flex flex-col p-10 gap-10">
        <div className="flex flex-row gap-10">
          <div className="basis-2/4">
            <div className="text-2xl pb-5">
              We are <Name />
            </div>
            <div>
              Our mission is to support communities by providing hosting
              services that are as disconnected as possible from existing major
              platforms.
            </div>

            <div className="pt-5">
              Profits from purchased services are used to provide resources, services, and spaces for communities to thrive and grow.
            </div>

            {/* <div className="pt-5">
              More information about our mission visit:  <Link className="link link-primary" href={companyUrl}>{company}</Link>
            </div> */}

          </div>
        </div>
      </div>
    </>
  );
}
