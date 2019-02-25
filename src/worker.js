import render from "./render";

console.log("worker here");

self.skipWaiting().then(function() {
  console.log("skip waiting i'm active");
});

self.addEventListener("fetch", event => {
  event.respondWith(fetchAndApply(event.request));
});

const dot = `
        digraph graphname {
          rankdir="LR";

          node [shape=rect]
          "@livepeer/apollo"
      "@livepeer/apollo" -> "@livepeer/graphql-sdk"
      "@livepeer/apollo" -> "@livepeer/sdk"
      "@livepeer/chroma"
      "@livepeer/explorer"
      "@livepeer/explorer" -> "@livepeer/apollo"
      "@livepeer/explorer" -> "@livepeer/graphql-sdk"
      "@livepeer/explorer" -> "@livepeer/merkle-miner"
      "@livepeer/graphql-sdk"
      "@livepeer/graphql-sdk" -> "@livepeer/sdk"
      "@livepeer/lpx"
      "@livepeer/lpx" -> "@livepeer/sdk"
      "@livepeer/merkle-miner"
      "@livepeer/player"
      "@livepeer/player" -> "@livepeer/apollo"
      "@livepeer/sdk"
      "@livepeer/subgraph"

        }
      `;

async function fetchAndApply(req) {
  try {
    if (!req.url.includes("svg")) {
      return fetch(req);
    }
    // const text = await request.text();
    return new Response(await render(dot));
  } catch (err) {
    return new Response([err.message, err.stack].join("\n"));
  }
}
