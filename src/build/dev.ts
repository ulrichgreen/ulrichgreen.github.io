import chokidar from "chokidar";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { buildClient } from "./assets/client.ts";
import { buildCss } from "./assets/css.ts";
import { distDirectory } from "./shared/paths.ts";

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
const LIVE_RELOAD_SCRIPT = `<script>
(() => {
    if (window.__siteLiveReloadSocket) {
        return;
    }

    const socket = new WebSocket(\`ws://\${location.host}\`);
    socket.addEventListener("message", () => {
        location.reload();
    });
    window.__siteLiveReloadSocket = socket;
})();
</script>`;

const ARTICLE_RENDER_PATH_PREFIXES = [
    "src/templates/article.tsx",
    "src/components/article-header/",
    "src/components/page-header/",
    "src/components/revision-history/",
    "src/components/series-nav/",
];

const RENDER_PATH_PREFIXES = [
    "src/templates/",
    "src/components/",
    "src/content-components.tsx",
    "src/build/render/",
    "src/context/",
    "src/islands/",
    "src/types/",
];

type FreshBuildMode = "full" | "content" | "render" | "render-articles";

type RebuildKind =
    | "content"
    | "styles"
    | "client"
    | "render"
    | "render-articles"
    | "full";

interface DevServerFileResolution {
    status: 200 | 400 | 404;
    filePath?: string;
}

function isInsideDirectory(candidate: string, directory: string): boolean {
    return candidate.startsWith(directory + sep) || candidate === directory;
}

export function resolveDevServerFilePath(
    requestUrl: string | undefined,
    directory = DIST,
): DevServerFileResolution {
    if (!requestUrl) return { status: 400 };

    let pathname: string;
    try {
        const decodedRawPath = decodeURIComponent(requestUrl.split(/[?#]/, 1)[0]);
        if (decodedRawPath.split("/").includes("..")) {
            return { status: 400 };
        }
        pathname = decodeURIComponent(
            new URL(requestUrl, "http://localhost").pathname,
        );
    } catch {
        return { status: 400 };
    }

    if (pathname.includes("\0")) return { status: 400 };

    let filePath = resolve(
        directory,
        pathname === "/" ? "index.html" : `.${pathname}`,
    );
    if (!isInsideDirectory(filePath, directory)) return { status: 400 };

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        const candidate = resolve(directory, `.${pathname}`, "index.html");
        if (
            isInsideDirectory(candidate, directory) &&
            existsSync(candidate) &&
            statSync(candidate).isFile()
        ) {
            filePath = candidate;
        }
    }

    if (
        !existsSync(filePath) ||
        !statSync(filePath).isFile() ||
        !isInsideDirectory(filePath, directory)
    ) {
        return { status: 404 };
    }

    return { status: 200, filePath };
}

function classifyChange(changedPath: string): RebuildKind {
    if (changedPath.startsWith("content")) return "content";
    if (changedPath.endsWith(".module.css")) return "full";
    if (
        changedPath.startsWith("src/styles") ||
        changedPath.startsWith("src/fonts")
    )
        return "styles";
    if (changedPath.startsWith("src/client")) return "client";

    if (
        ARTICLE_RENDER_PATH_PREFIXES.some((prefix) =>
            changedPath.startsWith(prefix),
        )
    ) {
        return "render-articles";
    }

    if (
        RENDER_PATH_PREFIXES.some((prefix) => changedPath.startsWith(prefix))
    ) {
        return "render";
    }

    return "full";
}

function runFreshBuild(mode: FreshBuildMode): Promise<void> {
    return new Promise((resolve, reject) => {
        const scriptPath =
            mode === "full"
                ? "./src/build/build.ts"
                : mode === "content"
                  ? "./src/build/dev-content.ts"
                  : "./src/build/dev-render.ts";
        const scriptArgs =
            mode === "full"
                ? ["--dev"]
                : mode === "render-articles"
                  ? ["articles"]
                  : [];
        const child = spawn(
            process.execPath,
            [
                "--import",
                "tsx",
                "--import",
                "./src/build/register-css-modules.ts",
                scriptPath,
                ...scriptArgs,
            ],
            {
                cwd: process.cwd(),
                stdio: "inherit",
                env: process.env,
            },
        );

        child.on("error", reject);
        child.on("exit", (code, signal) => {
            if (code === 0) {
                resolve();
                return;
            }

            if (signal) {
                reject(new Error(`Build terminated by signal ${signal}`));
                return;
            }

            reject(new Error(`Build exited with code ${String(code)}`));
        });
    });
}

export function startDevServer(): void {
    const server = http.createServer((req, res) => {
        const resolved = resolveDevServerFilePath(req.url);
        if (resolved.status === 400) {
            res.writeHead(400);
            res.end("Bad request");
            return;
        }
        if (resolved.status === 404 || !resolved.filePath) {
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

        const filePath = resolved.filePath;
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
                    await runFreshBuild("full");
                } else {
                    const kinds = new Set(changedPaths.map(classifyChange));
                    if (kinds.has("full")) {
                        await runFreshBuild("full");
                    } else {
                        const tasks: Promise<unknown>[] = [];
                        if (kinds.has("styles")) tasks.push(buildCss());
                        if (kinds.has("client")) tasks.push(buildClient());
                        if (kinds.has("content")) {
                            tasks.push(runFreshBuild("content"));
                        }
                        if (kinds.has("render")) {
                            tasks.push(runFreshBuild("render"));
                        } else if (kinds.has("render-articles")) {
                            tasks.push(runFreshBuild("render-articles"));
                        }
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
