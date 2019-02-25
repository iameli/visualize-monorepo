#!/usr/bin/env node
const path = require("path");
const tmp = require("tmp");
const opn = require("opn");
const fs = require("fs-extra");
import render from "./render";
const getPackages = require("get-monorepo-packages");

module.exports = async function(dir) {
  const packages = getPackages(dir);
  const allPackages = new Set();
  packages.forEach(({ package: pkg }) => {
    allPackages.add(pkg.name);
  });
  const dot = `
  digraph graphname {
    rankdir="LR";

    node [shape=rect]
    ${packages
      .map(({ package: pkg }) => {
        const lines = [];
        lines.push(`"${pkg.name}"`);
        const allDeps = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {})
        ].filter(dep => allPackages.has(dep));
        lines.push(...allDeps.map(dep => `"${pkg.name}" -> "${dep}"`));
        return lines.join("\n");
      })
      .join("\n")}

  }
`;
  // var viz = new Viz();
  console.log(dot);
  const str = await render(dot);
  console.log(str);
  // const clientScript = fs.readFileSync(
  //   path.resolve(__dirname, "dist", "client.js"),
  //   "utf8"
  // );
  // const output = template({
  //   clientScript,
  //   dot
  // });
  // var tmpFile = `${tmp.tmpNameSync()}.html`;
  // fs.writeFileSync(tmpFile, output, "utf8");
  // opn(tmpFile, { wait: false });
};

if (!module.parent) {
  const dir = process.argv[2] || process.cwd();
  module.exports(dir).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
