#!/usr/bin/env node
/**
 * Remove node_modules (root and mobile). Catches errors so the script
 * doesn't fail with ELIFECYCLE when files are locked or paths are long on Windows.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dirs = [
  path.join(root, "node_modules"),
  path.join(root, "mobile", "node_modules"),
];

for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
      console.log("Removed:", dir);
    }
  } catch (err) {
    console.warn("Could not remove", dir, "-", err.message);
  }
}

process.exit(0);
