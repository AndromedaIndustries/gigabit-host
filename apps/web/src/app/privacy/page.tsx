"use client";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      // @ts-ignore
      name="termly-embed"
      data-id="2b61c38c-7e9f-41c2-90bd-faa6d9abc418"
      data-type="iframe"
    />
  );
}