// Verifies the built package: every path in package.json entry fields exists,
// and CommonJS output parses as CommonJS (no ESM `import` statements).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
);
const errors = [];

const collectPaths = (value) =>
  typeof value === "string"
    ? [value]
    : Object.values(value ?? {}).flatMap(collectPaths);

const entryPaths = [
  packageJson.main,
  packageJson.module,
  packageJson.types,
  ...collectPaths(packageJson.exports),
];

for (const path of new Set(entryPaths)) {
  if (!existsSync(resolve(root, path))) {
    errors.push(`[entry] ${path} is referenced in package.json but missing`);
  }
}

for (const file of readdirSync(resolve(root, "dist"))) {
  if (!file.endsWith(".cjs")) continue;
  try {
    execFileSync(process.execPath, ["--check", resolve(root, "dist", file)], {
      stdio: "pipe",
    });
  } catch (error) {
    const lines = error.stderr?.toString().split("\n") ?? [];
    const message =
      lines.find((line) => line.startsWith("SyntaxError")) ??
      lines.find(Boolean);
    errors.push(`[cjs] dist/${file} is not valid CommonJS: ${message}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("dist:check passed");
