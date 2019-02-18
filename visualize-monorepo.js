#!/usr/bin/env node
const path = require("path");
const template = require("./template.js");
const tmp = require("tmp");
const opn = require("opn");
const fs = require("fs-extra");
const getPackages = require("get-monorepo-packages");

module.exports = function(dir) {
  const packages = getPackages(dir);
  const allPackages = new Set();
  packages.forEach(({ package }) => {
    allPackages.add(package.name);
  });
  const dot = `
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
`;
  const clientScript = fs.readFileSync(
    path.resolve(__dirname, "dist", "client.js"),
    "utf8"
  );
  const output = template({
    clientScript,
    dot
  });
  var tmpFile = `${tmp.tmpNameSync()}.html`;
  fs.writeFileSync(tmpFile, output, "utf8");
  opn(tmpFile, { wait: false });
};

if (!module.parent) {
  const dir = process.argv[2] || process.cwd();
  module.exports(dir);
}
