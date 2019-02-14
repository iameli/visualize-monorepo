#!/usr/bin/env node

const dir = process.argv[2] || process.cwd();

const fs = require("fs-extra");
const getPackages = require("get-monorepo-packages");
const packages = getPackages(dir);
const allPackages = new Set();
packages.forEach(({ package }) => {
  allPackages.add(package.name);
});
console.log(`
  digraph graphname {
    rankdir="LR";

    node [shape=rect]
    ${packages
      .map(({ package }) => {
        const lines = [];
        lines.push(`"${package.name}"`);
        const allDeps = [
          ...Object.keys(package.dependencies || {}),
          ...Object.keys(package.devDependencies || {})
        ].filter(dep => allPackages.has(dep));
        lines.push(...allDeps.map(dep => `"${package.name}" -> "${dep}"`));
        return lines.join("\n");
      })
      .join("\n")}

  }
`);
