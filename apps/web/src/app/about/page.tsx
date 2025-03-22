import Name from "@/components/name";

export default function About() {
  return (
    <>
      <div className="text-primary text-center text-4xl">About Us</div>
      <div className="text-warning text-center p-5">
        Our site is currently a work in progress and evolving over time.
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
              platforms to ensure that you&apos;re able to host without fear of
              being taken down<span className="align-super">*</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-tertiary">
        * - We do not support hosting of illegal content, please see our{" "}
        <a href="/acceptable_use_policy">Acceptable Use Policy</a> for more
        information
      </div>
    </>
  );
}
