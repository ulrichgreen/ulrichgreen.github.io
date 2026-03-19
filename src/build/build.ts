import { fileURLToPath } from "node:url";
import {
    applyHashedFilenames,
    devAssetManifest,
    generateAssetManifest,
} from "./assets/asset-manifest.ts";
import { cleanDist } from "./clean.ts";
import { buildAncillary } from "./artifacts/ancillary.ts";
import { buildClient } from "./assets/client.ts";
import { buildCss } from "./assets/css.ts";
import { buildImages } from "./assets/images.ts";
import { compilePages } from "./content/compile-pages.ts";
import {
    cleanGeneratedPages,
    discoverSourceFiles,
} from "./content/discover.ts";
import { enforcePerformanceBudgets } from "./performance-budgets.ts";
import { writePages } from "./render/write-pages.ts";
import {
    listArticleEntries,
    listArticleEntriesFromBuiltContent,
} from "./content/article-index.ts";
import { articlesDirectory } from "./shared/paths.ts";

export async function buildAll(options: { dev?: boolean } = {}): Promise<void> {
    const start = performance.now();

    if (!options.dev) cleanDist();
    await Promise.all([buildCss(), buildClient(), buildImages()]);
    const manifest = options.dev ? devAssetManifest : generateAssetManifest();

    const sourceFiles = discoverSourceFiles();
    const { compiled, failed } = await compilePages(sourceFiles);
    const articleIndex =
        failed.length === 0
            ? listArticleEntriesFromBuiltContent(compiled)
            : listArticleEntries(articlesDirectory);

    cleanGeneratedPages();
    writePages(compiled, articleIndex, manifest);

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
        }
        throw new Error(`Build failed: ${failed.length} page(s) had errors`);
    }

    const compiledArticles = compiled.filter((c) =>
        c.sourcePath.includes("/articles/"),
    );
    await buildAncillary(articleIndex, compiledArticles);
    if (!options.dev) applyHashedFilenames(manifest);
    if (!options.dev) enforcePerformanceBudgets();

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(`built ${compiled.length} pages in ${elapsed}s\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const dev = process.argv.includes("--dev");

    buildAll({ dev }).catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
