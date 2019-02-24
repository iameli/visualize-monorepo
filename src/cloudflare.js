const oldTextDecoder = self.TextDecoder;
self.TextDecoder = class {
  constructor(encoding) {
    if (encoding !== "utf8") {
      return undefined;
    }
    return new oldTextDecoder(encoding);
  }
};
self.location = { href: "https://butt.cards" };
const oldFetch = self.fetch;
self.fetch = (url, ...args) => {
  if (url === "https://module.wasm") {
    return Promise.resolve(new Response("fake binary"));
  }
  return oldFetch(url, ...args);
};
const oldInstantiate = WebAssembly.instantiate.bind(WebAssembly);
WebAssembly.instantiate = async (binary, info) => {
  const thingy = await oldInstantiate(VIZ_WASM, info);
  return { instance: thingy };
};

const render = require("./render");
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
// (async () => {
//   console.log(await render(dot));
// })();

self.addEventListener("fetch", event => {
  event.respondWith(fetchAndApply(event.request));
});

/**
 * Making a curl request that looks like
 * curl -X POST --data 'key=world' example.com
 * or
 * curl -X POST --form 'key=world' example.com
 */
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
