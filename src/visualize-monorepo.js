#!/usr/bin/env node
// import render from "./render";
import searchGithub from "./search-github";
import makeDot from "./make-dot";

export default async function visualizeMonorepo(repo) {
  const pkgs = await searchGithub(repo);
  console.log(makeDot(pkgs));
}

if (!module.parent) {
  const repo = process.argv[2] || process.cwd();
  visualizeMonorepo(repo).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
