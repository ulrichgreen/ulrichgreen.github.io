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
import { contentDirectory, distDirectory, writingDirectory } from "./paths.ts";
import type { BuiltContent } from "../types/content.ts";

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

    const sourceFiles = listSourceFiles();
    const pages = await Promise.all(
        sourceFiles.map((sourcePath) => buildContent(sourcePath)),
    );

    const compiledWriting: BuiltContent[] = [];
    for (let i = 0; i < sourceFiles.length; i++) {
        const page = pages[i];
        const outputPath = resolveOutputPath(sourceFiles[i]);

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, renderPage(page, writingIndex, assetManifest));

        if (sourceFiles[i].includes("/writing/")) {
            compiledWriting.push(page);
        }
    }

    buildSitemap(contentDirectory, writingIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    await buildFeed(writingIndex, compiledWriting);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildSite().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
