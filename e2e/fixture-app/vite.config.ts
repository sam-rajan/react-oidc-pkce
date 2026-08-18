import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    root: __dirname,
    plugins: [react()],
    resolve: {
        alias: {
            // Points at the actual built output rather than raw src/, so
            // this suite also validates the artifact real consumers get.
            "react-oidc-pkce": path.resolve(__dirname, "../../dist/esm/index.js"),
        },
    },
    server: {
        port: Number(process.env.FIXTURE_APP_PORT || 4401),
        strictPort: true,
    },
})
