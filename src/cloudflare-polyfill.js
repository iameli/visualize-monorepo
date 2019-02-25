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
