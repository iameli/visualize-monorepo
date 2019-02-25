import render from "./render";
import { searchGithub, getCommitGithub } from "./search-github";
import makeDot from "./make-dot";

if (typeof self.skipWaiting === "function") {
  self.skipWaiting().then(function() {
    console.log("skip waiting i'm active");
  });
}

self.addEventListener("fetch", event => {
  event.respondWith(fetchAndApply(event.request));
});

const GITHUB_PREFIX = "/github/";
const SVG_SUFFIX = ".svg";

async function fetchAndApply(req) {
  try {
    if (!req.url.includes("svg")) {
      return fetch(req);
    }
    const { pathname, origin } = new URL(req.url);
    if (!pathname.startsWith(GITHUB_PREFIX)) {
      throw new Error("only github supported for now");
    }
    const repo = pathname.slice(
      GITHUB_PREFIX.length,
      pathname.length - SVG_SUFFIX.length
    );
    // One slash means no SHA
    if (repo.split("").filter(x => x === "/").length < 2) {
      const commit = await getCommitGithub(repo);
      return Response.redirect(
        `${origin}/${GITHUB_PREFIX}${repo}/${commit}.svg`
      );
    }
    const pkgs = await searchGithub(
      repo
        .split("/")
        .slice(0, 2)
        .join("/")
    );
    const dot = makeDot(pkgs);
    return new Response(await render(dot), {
      headers: {
        "Cache-Control": "max-age=31556926"
      }
    });
  } catch (err) {
    return new Response([err.message, err.stack].join("\n"));
  }
}
