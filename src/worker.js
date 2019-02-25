import render from "./render";
import { searchGithub, getCommitGithub } from "./search-github";
import makeDot from "./make-dot";

if (typeof self.skipWaiting === "function") {
  self.skipWaiting().then(function() {
    console.log("skip waiting i'm active");
  });
}

self.addEventListener("fetch", event => {
  event.respondWith(fetchAndApply(event));
});

const GITHUB_PREFIX = "/github/";
const SVG_SUFFIX = ".svg";

async function fetchAndApply(event) {
  const req = event.request;
  try {
    const cache = caches.default;
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
      const cachedResponse = await cache.match(req);
      if (cachedResponse) {
        return cachedResponse;
      }
      const commit = await getCommitGithub(repo);
      const res = new Response(null, {
        status: 302,
        headers: {
          "cache-control": `max-age=${60 * 5}`,
          location: `${origin}${GITHUB_PREFIX}${repo}/${commit}.svg`
        }
      });
      event.waitUntil(cache.put(req, res.clone()));
      return res;
    }
    const cachedResponse = await cache.match(req);
    if (cachedResponse) {
      return cachedResponse;
    }
    const pkgs = await searchGithub(
      repo
        .split("/")
        .slice(0, 2)
        .join("/")
    );
    const dot = makeDot(pkgs);

    const res = new Response(await render(dot), {
      headers: {
        "cache-control": "max-age=31556926",
        "content-type": "image/svg+xml"
      }
    });
    event.waitUntil(cache.put(event.request, res.clone()));
    return res;
  } catch (err) {
    return new Response([err.message, err.stack].join("\n"));
  }
}
