import resolve, { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from "@rollup/plugin-terser";


import packageJson from "./package.json" assert { type: "json" };



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
          terser({sourceMap: false})
        ],
      },
      {
        input: "dist/esm/types/src/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
      }

];