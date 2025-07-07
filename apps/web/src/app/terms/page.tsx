"use client";
import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []); return (
    <iframe
      name="termly-embed"
      data-id="484f7fbc-68e8-4ac0-bc5d-a88a3d59fc1c"
      data-type="iframe"
    ></iframe>
  );
}