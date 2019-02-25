import Viz from "viz.js";
import { render, Module } from "viz.js/lite.render.js";

let instance;

export default async dot => {
  if (!instance) {
    instance = new Viz({ render, Module });
  }
  try {
    return await instance.renderString(dot);
  } catch (e) {
    // Create a new Viz instance (@see Caveats page for more info)
    instance = new Viz({ render, Module });
    throw e;
  }
};
