import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
const databaseConfig = [
  ...config,
  {
    rules: {
      "turbo/no-undeclared-env-vars": [
        "error",
        {
          allowList: ["NODE_ENV"],
        },
      ],
    },
  },
  {
    ignores: ["**/migrations/**", "**/generated/**"],
  },
];

export default databaseConfig;
