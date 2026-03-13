import chokidar from "chokidar";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { buildAll } from "./build.ts";
import { buildClient } from "./assets/client.ts";
import { buildCss } from "./assets/css.ts";
import { devAssetManifest } from "./assets/asset-manifest.ts";
import { compilePages } from "./content/compile-pages.ts";
import {
    cleanGeneratedPages,
    discoverSourceFiles,
} from "./content/discover.ts";
import { listWritingEntries } from "./content/writing-index.ts";
import { writePages } from "./render/write-pages.ts";
import { distDirectory, writingDirectory } from "./shared/paths.ts";

const PORT = 3009;
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
const LIVE_RELOAD_SCRIPT =
    "<script>new WebSocket(`ws://${location.host}`).onmessage=()=>location.reload()</script>";

type RebuildKind = "content" | "styles" | "client" | "full";

function classifyChange(changedPath: string): RebuildKind {
    if (changedPath.startsWith("content")) return "content";
    if (
        changedPath.startsWith("src/styles") ||
        changedPath.startsWith("src/fonts")
    )
        return "styles";
    if (changedPath.startsWith("src/client")) return "client";
    return "full";
}

async function rebuildContent(): Promise<void> {
    const start = performance.now();
    const writingIndex = listWritingEntries(writingDirectory);
    const sourceFiles = discoverSourceFiles();
    const { compiled, failed } = await compilePages(sourceFiles);
    cleanGeneratedPages();
    writePages(compiled, writingIndex, devAssetManifest);
    for (const { file, error } of failed) {
        process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
    }
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(`built ${compiled.length} pages in ${elapsed}s\n`);
}

export function startDevServer(): void {
    const server = http.createServer((req, res) => {
        if (!req.url) {
            res.writeHead(400);
            res.end("Bad request");
            return;
        }

        let filePath = join(DIST, req.url === "/" ? "index.html" : req.url);
        if (!existsSync(filePath)) filePath = join(DIST, req.url, "index.html");
        if (!existsSync(filePath)) {
            const notFoundPage = join(DIST, "404.html");
            if (existsSync(notFoundPage)) {
                let body = readFileSync(notFoundPage);
                body = Buffer.from(
                    body
                        .toString()
                        .replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`),
                );
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(body);
            } else {
                res.writeHead(404);
                res.end("Not found");
            }
            return;
        }

        const mime = MIME[extname(filePath)] || "text/plain";
        let body = readFileSync(filePath);
        if (extname(filePath) === ".html") {
            body = Buffer.from(
                body
                    .toString()
                    .replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`),
            );
        }

        res.writeHead(200, { "Content-Type": mime });
        res.end(body);
    });

    const wss = new WebSocketServer({ server });

    const pendingChanges = new Set<string>();
    let buildQueued = false;
    let buildRunning = false;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const DEBOUNCE_MS = 80;

    function reload() {
        wss.clients.forEach((client) => {
            try {
                if (client.readyState === 1) client.send("reload");
            } catch {
                /* ignore stale connections */
            }
        });
    }

    async function runBuild() {
        if (buildRunning) {
            buildQueued = true;
            return;
        }

        buildRunning = true;

        while (true) {
            const changedPaths = [...pendingChanges];
            pendingChanges.clear();

            try {
                if (changedPaths.length === 0) {
                    await buildAll({ dev: true });
                } else {
                    const kinds = new Set(changedPaths.map(classifyChange));
                    if (kinds.has("full")) {
                        await buildAll({ dev: true });
                    } else {
                        const tasks: Promise<unknown>[] = [];
                        if (kinds.has("styles")) tasks.push(buildCss());
                        if (kinds.has("client")) tasks.push(buildClient());
                        if (kinds.has("content")) tasks.push(rebuildContent());
                        await Promise.all(tasks);
                    }
                }
                reload();
            } catch (error) {
                process.stderr.write(
                    `\n  error  ${error instanceof Error ? error.message : String(error)}\n\n`,
                );
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

    chokidar
        .watch(["content", "src"], { ignoreInitial: true })
        .on("all", (_event, path) => {
            process.stdout.write(`  ~ ${path}\n`);
            pendingChanges.add(path);
            debouncedBuild();
        });

    void runBuild();

    server.listen(PORT, () =>
        process.stdout.write(`\n  http://localhost:${PORT}\n\n`),
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startDevServer();
}
