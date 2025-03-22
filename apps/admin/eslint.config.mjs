/** @type {import("eslint").Linter.Config} */
import { nextJsConfig } from "@repo/eslint-config/next-js";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextJsConfig_custom = [
  ...nextJsConfig,
  ...compat.extends("next/typescript"),
];

export default nextJsConfig_custom;
