import fetch from "isomorphic-fetch";
import { user, token } from "./github-token.json";
import { btoa, atob } from "isomorphic-base64";

const githubFetch = fileUrl =>
  fetch(`https://api.github.com/repos/${fileUrl}`, {
    headers: {
      authorization: "Basic " + btoa(user + ":" + token)
    }
  });

export default async function searchGithub(repo) {
  let res = await githubFetch(`${repo}/contents/package.json`);
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  const { content } = await res.json();
  const rootPkg = JSON.parse(atob(content));
  const workspaces = rootPkg.workspaces;
  const pkgPaths = [];
  for (const wPath of workspaces) {
    if (wPath.includes("**")) {
      throw new Error(`workspace globbing with '**' not yet supported`);
    }
    // If it doesn't contain a wildcard just add it
    if (!wPath.includes("*")) {
      pkgPaths.push(wPath);
    }
    // If it does, we gotta search for them all
    const prefix = wPath.slice(0, wPath.length - 2);
    res = await githubFetch(`${repo}/contents/${prefix}`);
    const dirs = await res.json();
    pkgPaths.push(...dirs.map(dir => dir.path));
  }
  const output = {};
  for (const pkgPath of pkgPaths) {
    res = await githubFetch(`${repo}/contents/${pkgPath}/package.json`);
    const { content } = await res.json();
    const pkg = JSON.parse(atob(content));
    output[pkg.name] = pkg;
  }
  return output;
}

if (!module.parent) {
  searchGithub(process.argv[2]).then(pkgs =>
    console.log(JSON.stringify(pkgs, null, 2))
  );
}
