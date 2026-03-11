import chokidar from "chokidar";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { extname, join } from "node:path";
import { WebSocketServer } from "ws";
import { buildAll } from "./build.ts";
import { distDirectory } from "./paths.ts";

const PORT = 3000;
const DIST = distDirectory;
const MIME: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".xml": "application/xml",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".txt": "text/plain",
};
const INJECT =
    "<script>new WebSocket(`ws://${location.host}`).onmessage=()=>location.reload()</script>";

const server = http.createServer((req, res) => {
    if (!req.url) {
        res.writeHead(400);
        res.end("Bad request");
        return;
    }

    let filePath = join(DIST, req.url === "/" ? "index.html" : req.url);
    if (!existsSync(filePath)) filePath = join(DIST, req.url, "index.html");
    if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
    }

    const mime = MIME[extname(filePath)] || "text/plain";
    let body = readFileSync(filePath);
    if (extname(filePath) === ".html") {
        body = Buffer.from(
            body.toString().replace("</body>", `${INJECT}</body>`),
        );
    }

    res.writeHead(200, { "Content-Type": mime });
    res.end(body);
});

const wss = new WebSocketServer({ server });

let buildQueued = false;
let buildRunning = false;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const DEBOUNCE_MS = 80;

async function runBuild() {
    if (buildRunning) {
        buildQueued = true;
        return;
    }

    buildRunning = true;

    while (true) {
        try {
            await buildAll();
            wss.clients.forEach((client) => {
                try {
                    if (client.readyState === 1) {
                        client.send("reload");
                    }
                } catch { /* ignore stale connections */ }
            });
        } catch (error) {
            process.stderr.write(`${String(error)}\n`);
        }

        if (buildQueued) {
            buildQueued = false;
            continue;
        }

        buildRunning = false;
        break;
    }
}

function debouncedBuild() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void runBuild(), DEBOUNCE_MS);
}

chokidar.watch(["content", "src"], { ignoreInitial: true }).on("all", () => {
    debouncedBuild();
});

void runBuild();

server.listen(PORT, () =>
    process.stdout.write(`dev server: http://localhost:${PORT}\n`),
);
