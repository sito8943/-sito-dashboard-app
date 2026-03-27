#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const docs = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".sito/README.md",
  ".sito/usage-guide.md",
  ".sito/style-customization.md",
  ".sito/translations-reference.md",
];

const failures = [];

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const expectInFile = (relativePath, needle, description) => {
  const content = read(relativePath);
  if (!content.includes(needle)) {
    failures.push(
      `[content] ${relativePath}: missing ${description} (${JSON.stringify(needle)})`,
    );
  }
};

const checkRequiredFiles = () => {
  for (const file of docs) {
    if (!exists(file)) {
      failures.push(`[exists] missing required doc file: ${file}`);
    }
  }
};

const checkPolicyMarkers = () => {
  expectInFile(
    "README.md",
    "## Documentation scope and source of truth",
    "README documentation-scope section",
  );
  expectInFile(
    "AGENTS.md",
    "## Documentation Scope",
    "AGENTS documentation-scope section",
  );
  expectInFile(
    "CLAUDE.md",
    "Documentation policy:",
    "CLAUDE documentation policy section",
  );
  expectInFile(
    ".sito/README.md",
    "Internal scope in this repository:",
    ".sito upstream scope disclaimer",
  );
  expectInFile(
    ".sito/usage-guide.md",
    "## Internal Scope (This Repository)",
    ".sito usage-guide scope section",
  );

  expectInFile(
    "README.md",
    "ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider",
    "canonical provider order note",
  );
  expectInFile(
    "AGENTS.md",
    "ConfigProvider -> ManagerProvider -> AuthProvider -> NotificationProvider -> DrawerMenuProvider",
    "canonical provider order note",
  );

  expectInFile(
    "README.md",
    "icon?: IconDefinition",
    "dashboard-app IconButton contract",
  );
  expectInFile(
    "AGENTS.md",
    "expects `icon: IconDefinition`",
    "dashboard-app IconButton contract",
  );
  expectInFile(
    ".sito/usage-guide.md",
    "React-node `icon` examples above apply to direct `@sito/dashboard` usage.",
    "upstream IconButton context note",
  );
};

const checkNoDeprecatedReferences = () => {
  const markdownFiles = fs
    .readdirSync(root)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(root, name));

  const sitoFiles = fs
    .readdirSync(path.join(root, ".sito"))
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(root, ".sito", name));

  const files = [...markdownFiles, ...sitoFiles];
  for (const absFile of files) {
    const relativePath = path.relative(root, absFile);
    const content = fs.readFileSync(absFile, "utf8");
    if (content.includes("@.sito/dashboard.md")) {
      failures.push(
        `[content] ${relativePath}: deprecated reference '@.sito/dashboard.md' must not be used`,
      );
    }
  }
};

const checkNodeRuntimeAlignment = () => {
  const nvmrcPath = path.join(root, ".nvmrc");
  if (!fs.existsSync(nvmrcPath)) {
    failures.push("[runtime] .nvmrc not found");
    return;
  }
  const nvmrc = fs.readFileSync(nvmrcPath, "utf8").trim();
  const readme = read("README.md");
  const agents = read("AGENTS.md");

  if (!readme.includes(`Node.js \`${nvmrc}.x\``)) {
    failures.push(
      `[runtime] README.md must mention Node.js \`${nvmrc}.x\` to align with .nvmrc`,
    );
  }

  if (!agents.includes(`| Runtime      | Node.js              | ${nvmrc}.x`)) {
    failures.push(
      `[runtime] AGENTS.md Tech Stack table must mention Node.js ${nvmrc}.x`,
    );
  }
};

const checkRelativeMarkdownLinks = () => {
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of docs) {
    const filePath = path.join(root, file);
    const content = fs.readFileSync(filePath, "utf8");
    const baseDir = path.dirname(filePath);

    let match = linkRegex.exec(content);
    while (match) {
      const rawTarget = match[1].trim();
      const [target] = rawTarget.split(/\s+/);

      if (
        target.startsWith("#") ||
        target.startsWith("http://") ||
        target.startsWith("https://") ||
        target.startsWith("mailto:") ||
        target.startsWith("tel:")
      ) {
        match = linkRegex.exec(content);
        continue;
      }

      const withoutAnchor = target.split("#")[0];
      const withoutQuery = withoutAnchor.split("?")[0];

      if (!withoutQuery) {
        match = linkRegex.exec(content);
        continue;
      }

      const resolved = path.resolve(baseDir, withoutQuery);
      if (!fs.existsSync(resolved)) {
        failures.push(
          `[link] ${file}: broken relative link ${JSON.stringify(target)}`,
        );
      }

      match = linkRegex.exec(content);
    }
  }
};

const main = () => {
  checkRequiredFiles();
  checkPolicyMarkers();
  checkNoDeprecatedReferences();
  checkNodeRuntimeAlignment();
  checkRelativeMarkdownLinks();

  if (failures.length > 0) {
    console.error("docs:check failed with the following issues:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("docs:check passed");
};

main();
