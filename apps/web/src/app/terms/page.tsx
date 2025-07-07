"use client";
import { useEffect } from "react";

export default function Terms() {
  const id = process.env.NEXT_PUBLIC_TOS_ID

  console.log(id)

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []); return (
    <div
      name="termly-embed"
      data-id={id}
      data-type="iframe"
    ></div>
  );
}