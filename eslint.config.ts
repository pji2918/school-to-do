import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: [js.configs.recommended, tseslint.configs.strictTypeChecked],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
        },
    },
    {
        files: ["**/*.css"],
        plugins: { css },
        language: "css/css",
        extends: ["css/recommended"],
    },
    eslintConfigPrettier,
]);
