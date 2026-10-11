#!/usr/bin/env node
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { initApify, isAtHome } from "./billing.js";
import { SERVER_NAME, SERVER_VERSION, createServer } from "./server.js";

const MAX_BODY_BYTES = 1_000_000;

/**
 * On the Apify platform (Standby mode) the container must serve HTTP on
 * 0.0.0.0:$ACTOR_WEB_SERVER_PORT, so HTTP mode is forced there.
 */
function parseArgs(argv: string[]) {
  const atHome = isAtHome();
  const envPort = atHome
    ? (process.env.ACTOR_WEB_SERVER_PORT || process.env.ACTOR_STANDBY_PORT || process.env.PORT || 3000)
    : (process.env.PORT ?? 3000);
  const args = {
    http: atHome,
    port: Number(envPort),
    host: atHome ? "0.0.0.0" : (process.env.HOST ?? "127.0.0.1"),
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--http") args.http = true;
    else if (a === "--port") args.port = Number(argv[++i]);
    else if (a.startsWith("--port=")) args.port = Number(a.slice(7));
    else if (a === "--host") args.host = argv[++i] ?? args.host;
    else if (a.startsWith("--host=")) args.host = a.slice(7);
    else if (a === "--help" || a === "-h") {
      console.error(
        `${SERVER_NAME} ${SERVER_VERSION}\n\nUsage: app-review-intel-mcp [--http] [--port N] [--host H]\n\n` +
          `  (default)  MCP over stdio\n  --http     MCP Streamable HTTP on http://HOST:PORT/mcp (PORT env, default 3000)\n`,
      );
      process.exit(0);
    }
  }
  if (!Number.isInteger(args.port) || args.port < 0 || args.port > 65535) {
    console.error(`Invalid port: ${args.port}`);
    process.exit(2);
  }
  return args;
}

async function runStdio() {
  // stdout is the JSON-RPC channel: route any library console output (e.g. the
  // Apify SDK logger) to stderr so it can't corrupt the protocol stream.
  console.log = console.info = console.debug = console.error;
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${SERVER_NAME}] running on stdio`);
  const shutdown = async () => {
    await server.close().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  // Client went away; don't let SDK timers (e.g. Apify's) keep us alive.
  process.stdin.on("end", shutdown);
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.headersSent) return;
  res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
}

function jsonRpcError(res: ServerResponse, status: number, message: string, code = -32000) {
  sendJson(res, status, { jsonrpc: "2.0", error: { code, message }, id: null });
}

/**
 * Stateless Streamable HTTP: each POST /mcp gets a fresh server + transport.
 * All tools are read-only and independent, so no session state is needed,
 * which keeps the server horizontally scalable.
 */
async function runHttp(host: string, port: number) {
  const httpServer = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    try {
      // GET / doubles as the Apify Standby readiness probe
      // (sent with the `x-apify-container-server-readiness-probe` header).
      if (url.pathname === "/health" || (url.pathname === "/" && req.method === "GET")) {
        return sendJson(res, 200, { status: "ok", name: SERVER_NAME, version: SERVER_VERSION, endpoint: "/mcp" });
      }
      if (url.pathname !== "/mcp") return sendJson(res, 404, { error: "Not found" });
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return jsonRpcError(res, 405, "Method not allowed (stateless server: use POST /mcp)");
      }

      const body = await readJsonBody(req);
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      const status = (err as { status?: number }).status ?? 500;
      if (status === 500) console.error("[http] error handling request:", err);
      jsonRpcError(res, status, status === 500 ? "Internal server error" : (err as Error).message, status === 400 ? -32700 : -32000);
    }
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, resolve);
  });
  const addr = httpServer.address();
  const actualPort = typeof addr === "object" && addr ? addr.port : port;
  console.error(`[${SERVER_NAME}] Streamable HTTP listening on http://${host}:${actualPort}/mcp`);

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (isAtHome()) await initApify();
  await (args.http ? runHttp(args.host, args.port) : runStdio());
}

main().catch((err) => {
  console.error(`[${SERVER_NAME}] fatal:`, err);
  process.exit(1);
});
