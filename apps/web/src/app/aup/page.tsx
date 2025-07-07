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
      data-id="74d91a1b-6e8b-4d65-a18e-290c1372f200"
      data-type="iframe"
    />
  );
}