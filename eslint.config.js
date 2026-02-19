import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "dist-ssr/**",
      "node_modules/**",
      ".storybook/**",
      "*.local",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.stories.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
