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

export async function buildSite(assetManifest?: AssetManifest): Promise<number> {
    const writingIndex = listWritingEntries(writingDirectory);
    cleanGeneratedPages();

    const sourceFiles = listSourceFiles();
    const results = await Promise.allSettled(
        sourceFiles.map((sourcePath) => buildContent(sourcePath)),
    );

    const failed: { file: string; error: unknown }[] = [];
    const compiledWriting: BuiltContent[] = [];

    for (let i = 0; i < sourceFiles.length; i++) {
        const result = results[i];
        if (result.status === "rejected") {
            failed.push({ file: sourceFiles[i], error: result.reason });
            continue;
        }

        const page = result.value;
        const outputPath = resolveOutputPath(sourceFiles[i]);

        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, renderPage(page, writingIndex, assetManifest));

        if (sourceFiles[i].includes("/writing/")) {
            compiledWriting.push(page);
        }
    }

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`Failed to build ${file}: ${String(error)}\n`);
        }
        throw new Error(`Build failed: ${failed.length} page(s) had errors`);
    }

    buildSitemap(contentDirectory, writingIndex);
    buildRobots();
    buildHeaders();
    buildOgImage();
    await buildFeed(writingIndex, compiledWriting);

    return sourceFiles.length - failed.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildSite().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
