import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AssetManifest } from "./asset-manifest.ts";
import { buildContent } from "./build-content.ts";
import { buildFeed } from "./feed.ts";
import { renderPage } from "./render-react-page.tsx";
import { buildHeaders } from "./headers.ts";
import { buildOgImage } from "./og-image.ts";
import { buildRobots } from "./robots.ts";
import { buildSitemap } from "./sitemap.ts";
import { listWritingEntries } from "./writing-index.ts";

const contentDirectory = fileURLToPath(
    new URL("../../content", import.meta.url),
);
const distDirectory = fileURLToPath(new URL("../../dist", import.meta.url));
const writingDirectory = join(contentDirectory, "writing");

function listSourceFiles(): string[] {
    const topLevelPages = readdirSync(contentDirectory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => join(contentDirectory, file));
    const writingPages = readdirSync(writingDirectory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => join(writingDirectory, file));

    return [...topLevelPages, ...writingPages];
}

function resolveOutputPath(sourcePath: string): string {
    return join(
        distDirectory,
        relative(contentDirectory, sourcePath).replace(/\.mdx$/, ".html"),
    );
}

function cleanGeneratedPages() {
    mkdirSync(distDirectory, { recursive: true });

    for (const entry of readdirSync(distDirectory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".html")) {
            rmSync(join(distDirectory, entry.name), { force: true });
        }
    }

    rmSync(join(distDirectory, "writing"), { recursive: true, force: true });
}

export async function buildSite(assetManifest?: AssetManifest): Promise<void> {
    const writingIndex = listWritingEntries(writingDirectory);
    cleanGeneratedPages();

    for (const sourcePath of listSourceFiles()) {
        const page = await buildContent(sourcePath);
        const outputPath = resolveOutputPath(sourcePath);

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, renderPage(page, writingIndex, assetManifest));
    }

    buildSitemap(contentDirectory, writingIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    await buildFeed(writingDirectory, writingIndex);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildSite().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
