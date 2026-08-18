import resolve, { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from "@rollup/plugin-terser";


import packageJson from "./package.json" with { type: "json" };

// Emits a dist/cjs/package.json marking that directory as CommonJS.
// Without it, Node treats dist/cjs/index.js as ESM (inheriting "type":
// "module" from the root package.json) despite it being CJS-formatted
// output, and require() silently resolves to no exports.
function emitCjsPackageJson() {
    return {
        name: "emit-cjs-package-json",
        generateBundle(outputOptions) {
            if (outputOptions.format === "cjs") {
                this.emitFile({
                    type: "asset",
                    fileName: "package.json",
                    source: JSON.stringify({ type: "commonjs" }, null, 2)
                })
            }
        }
    }
}

export default [
    {
        input: "src/index.ts",
        external: Object.keys(packageJson.peerDependencies),
        output: [
          {
            file: packageJson.main,
            format: "cjs",
            sourcemap: false
          },
          {
            file: packageJson.module,
            format: "esm",
            sourcemap: false
          },
        ],
        plugins: [
          peerDepsExternal(),
          resolve(),
          nodeResolve(),
          commonjs({sourceMap: false}),
          typescript({ tsconfig: "./tsconfig.json", sourceMap: false }),
          terser({sourceMap: false}),
          emitCjsPackageJson()
        ],
      },
      {
        input: "dist/esm/types/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
      }

];