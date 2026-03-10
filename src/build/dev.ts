import chokidar from "chokidar";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { extname, join } from "node:path";
import { WebSocketServer } from "ws";

const PORT = 3000;
const DIST = new URL("../../dist", import.meta.url).pathname;
const MIME: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
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

function rebuild() {
    const proc = spawn("make", ["build"], { stdio: "inherit" });
    proc.on("close", (code) => {
        if (code === 0) {
            wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send("reload");
                }
            });
        }
    });
}

chokidar.watch(["content", "src"], { ignoreInitial: true }).on("all", rebuild);

server.listen(PORT, () =>
    process.stdout.write(`dev server: http://localhost:${PORT}\n`),
);
