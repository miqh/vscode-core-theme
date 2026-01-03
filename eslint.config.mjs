import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import configPrettier from "eslint-config-prettier/flat";
import prettier from "eslint-plugin-prettier";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  configPrettier,
  {
    languageOptions: {
      globals: {
        console: true,
        process: true,
      },
    },
    plugins: { prettier },
    rules: {
      "prettier/prettier": "error",
    },
  },
  globalIgnores(["dist/", "node_modules/"]),
);
