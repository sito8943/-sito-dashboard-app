#!/usr/bin/env node

/**
 * depcheck expects `require("minimatch")` to be callable.
 * Newer minimatch versions return an object whose callable API is at `.minimatch`.
 *
 * We patch Node's module loader before depcheck is loaded.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function patchedRequire(id) {
  const loaded = originalRequire.apply(this, arguments);

  if (
    id === "minimatch" &&
    typeof loaded !== "function" &&
    typeof loaded?.minimatch === "function"
  ) {
    return loaded.minimatch;
  }

  return loaded;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("depcheck/bin/depcheck.js");
