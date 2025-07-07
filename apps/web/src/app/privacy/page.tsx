"use client";
import { useEffect } from "react";

export default function Privacy() {
  const id = process.env.NEXT_PUBLIC_PRIVACY_ID

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