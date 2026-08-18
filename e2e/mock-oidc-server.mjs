import { createServer } from "node:http"
import { createHash, randomUUID } from "node:crypto"

const PORT = Number(process.env.MOCK_OIDC_PORT || 4400)

const authCodes = new Map()
const refreshTokens = new Map()

let control = {
    expiresIn: 3600,
    badNonce: false,
    tokenErrorGrantTypes: new Set(),
}

function resetControl() {
    control = { expiresIn: 3600, badNonce: false, tokenErrorGrantTypes: new Set() }
}

function base64url(buffer) {
    return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function makeIdToken(nonce) {
    const header = base64url(Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })))
    const payload = base64url(Buffer.from(JSON.stringify({
        sub: "test-user",
        iss: `http://localhost:${PORT}`,
        aud: "test-client",
        iat: Math.floor(Date.now() / 1000),
        nonce,
    })))
    return `${header}.${payload}.`
}

function sendJson(res, status, body) {
    const json = JSON.stringify(body)
    res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(json) })
    res.end(json)
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = ""
        req.on("data", (chunk) => { data += chunk })
        req.on("end", () => resolve(data))
        req.on("error", reject)
    })
}

const server = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.writeHead(204)
        res.end()
        return
    }

    const url = new URL(req.url, `http://localhost:${PORT}`)

    if (req.method === "GET" && url.pathname === "/authorize") {
        const redirectUri = url.searchParams.get("redirect_uri")
        const codeChallenge = url.searchParams.get("code_challenge")
        const state = url.searchParams.get("state")
        const nonce = url.searchParams.get("nonce")

        if (!redirectUri || !codeChallenge) {
            res.writeHead(400)
            res.end("missing required params")
            return
        }

        const code = randomUUID()
        authCodes.set(code, {
            codeChallenge,
            redirectUri,
            nonce: control.badNonce ? "wrong-nonce" : nonce,
            expiresIn: control.expiresIn,
            used: false,
        })

        const target = new URL(redirectUri)
        target.searchParams.set("code", code)
        if (state !== null) target.searchParams.set("state", state)

        res.writeHead(302, { Location: target.toString() })
        res.end()
        return
    }

    if (req.method === "POST" && url.pathname === "/token") {
        const raw = await readBody(req)
        const body = new URLSearchParams(raw)
        const grantType = body.get("grant_type")

        if (control.tokenErrorGrantTypes.has(grantType) || control.tokenErrorGrantTypes.has("*")) {
            sendJson(res, 400, { error: "server_error" })
            return
        }

        if (grantType === "authorization_code") {
            const code = body.get("code")
            const entry = authCodes.get(code)
            if (!entry || entry.used) {
                sendJson(res, 400, { error: "invalid_grant" })
                return
            }
            if (entry.redirectUri !== body.get("redirect_uri")) {
                sendJson(res, 400, { error: "invalid_grant" })
                return
            }
            const expectedChallenge = base64url(createHash("sha256").update(body.get("code_verifier") || "").digest())
            if (expectedChallenge !== entry.codeChallenge) {
                sendJson(res, 400, { error: "invalid_grant" })
                return
            }
            entry.used = true

            const refreshToken = randomUUID()
            refreshTokens.set(refreshToken, { nonce: entry.nonce, expiresIn: entry.expiresIn })

            sendJson(res, 200, {
                access_token: randomUUID(),
                id_token: makeIdToken(entry.nonce),
                refresh_token: refreshToken,
                expires_in: entry.expiresIn,
                token_type: "Bearer",
            })
            return
        }

        if (grantType === "refresh_token") {
            const token = body.get("refresh_token")
            const entry = refreshTokens.get(token)
            if (!entry) {
                sendJson(res, 400, { error: "invalid_grant" })
                return
            }
            sendJson(res, 200, {
                access_token: randomUUID(),
                id_token: makeIdToken(entry.nonce),
                refresh_token: token,
                expires_in: control.expiresIn,
                token_type: "Bearer",
            })
            return
        }

        sendJson(res, 400, { error: "unsupported_grant_type" })
        return
    }

    if (req.method === "POST" && url.pathname === "/_control/reset") {
        resetControl()
        sendJson(res, 200, { ok: true })
        return
    }

    if (req.method === "POST" && url.pathname === "/_control/expires-in") {
        const raw = await readBody(req)
        const { seconds } = JSON.parse(raw || "{}")
        control.expiresIn = seconds
        sendJson(res, 200, { ok: true })
        return
    }

    if (req.method === "POST" && url.pathname === "/_control/bad-nonce") {
        control.badNonce = true
        sendJson(res, 200, { ok: true })
        return
    }

    if (req.method === "POST" && url.pathname === "/_control/token-error") {
        const raw = await readBody(req)
        const { grantType } = JSON.parse(raw || "{}")
        control.tokenErrorGrantTypes.add(grantType || "*")
        sendJson(res, 200, { ok: true })
        return
    }

    res.writeHead(404)
    res.end("not found")
})

server.listen(PORT, () => {
    console.log(`mock OIDC server listening on http://localhost:${PORT}`)
})
