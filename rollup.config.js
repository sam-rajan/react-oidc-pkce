import resolve, { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";


import packageJson from "./package.json" assert { type: "json" };



export default [
    {
        input: "src/index.ts",
        external: Object.keys(packageJson.peerDependencies),
        output: [
          {
            file: packageJson.main,
            format: "cjs",
            sourcemap: true,
          },
          {
            file: packageJson.module,
            format: "esm",
            sourcemap: true,
          },
        ],
        plugins: [
          resolve(),
          nodeResolve(),
          commonjs(),
          typescript({ tsconfig: "./tsconfig.json" })
        ],
      },
      {
        input: "dist/esm/types/src/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
      }

];