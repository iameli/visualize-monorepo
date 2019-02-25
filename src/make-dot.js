export default function makeDot(pkgs) {
  const allPackages = new Set(Object.keys(pkgs));
  const dot = `
  digraph graphname {
    rankdir="LR";

    node [shape=rect]
    ${Object.values(pkgs)
      .map(pkg => {
        const lines = [];
        lines.push(`"${pkg.name}"`);
        const allDeps = [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.devDependencies || {})
        ].filter(dep => allPackages.has(dep));
        lines.push(...allDeps.map(dep => `"${pkg.name}" -> "${dep}"`));
        return lines.join("\n");
      })
      .join("\n")}

  }
`;
  return dot;
}
