import render from "./render";
import searchGithub from "./search-github";
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
    const { pathname } = new URL(req.url);
    if (!pathname.startsWith(GITHUB_PREFIX)) {
      throw new Error("only github supported for now");
    }
    const repo = pathname.slice(
      GITHUB_PREFIX.length,
      pathname.length - SVG_SUFFIX.length
    );
    console.log(repo);
    const pkgs = await searchGithub(repo);
    const dot = makeDot(pkgs);
    return new Response(await render(dot));
  } catch (err) {
    return new Response([err.message, err.stack].join("\n"));
  }
}
