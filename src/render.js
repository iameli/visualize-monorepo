const Viz = require("./viz-bpowers/viz");
const { render, Module } = require("./viz-bpowers/lite.render.js");

let instance;

module.exports = async dot => {
  if (!instance) {
    viz = new Viz({ render, Module });
  }
  try {
    const prom = viz.renderString(dot);
    return await prom;
  } catch (e) {
    // Create a new Viz instance (@see Caveats page for more info)
    viz = new Viz({ render, Module });
    throw e;
  }
};
