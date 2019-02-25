import fetch from "isomorphic-fetch";
import { user, token } from "./github-token.json";
import { btoa, atob } from "isomorphic-base64";

const githubFetch = fileUrl =>
  fetch(`https://api.github.com/repos/${fileUrl}`, {
    headers: {
      "user-agent": "monorepo.ooo",
      authorization: "Basic " + btoa(user + ":" + token)
    }
  });

const toJson = async res => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`failed to parse JSON: ${text}`);
  }
};

export async function getCommitGithub(repo) {
  console.log(repo);
  let res = await githubFetch(`${repo}`);
  const { default_branch } = await toJson(res);
  res = await githubFetch(`${repo}/branches`);
  const branches = await toJson(res);
  const branch = branches.find(branch => branch.name === default_branch);
  return branch.commit.sha;
}

export async function searchGithub(repo, commit) {
  let res = await githubFetch(`${repo}/contents/package.json`);
  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  const { content } = await toJson(res);
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
    const dirs = await toJson(res);
    pkgPaths.push(...dirs.map(dir => dir.path));
  }
  const output = {};
  for (const pkgPath of pkgPaths) {
    res = await githubFetch(`${repo}/contents/${pkgPath}/package.json`);
    const { content } = await toJson(res);
    const pkg = JSON.parse(atob(content));
    output[pkg.name] = pkg;
  }
  return output;
}

if (typeof module !== "undefined" && !module.parent) {
  searchGithub(process.argv[2]).then(pkgs =>
    console.log(JSON.stringify(pkgs, null, 2))
  );
}
