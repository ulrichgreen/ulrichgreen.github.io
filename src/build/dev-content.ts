import { fileURLToPath } from "node:url";
import { devAssetManifest } from "./assets/asset-manifest.ts";
import {
    listArticleEntries,
    listArticleEntriesFromBuiltContent,
} from "./content/article-index.ts";
import { compilePages } from "./content/compile-pages.ts";
import {
    cleanGeneratedPages,
    discoverSourceFiles,
} from "./content/discover.ts";
import { writePages } from "./render/write-pages.ts";
import { articlesDirectory } from "./shared/paths.ts";

export async function rebuildContent(): Promise<void> {
    const start = performance.now();
    const sourceFiles = discoverSourceFiles();
    const { compiled, failed } = await compilePages(sourceFiles);
    const articleIndex =
        failed.length === 0
            ? listArticleEntriesFromBuiltContent(compiled)
            : listArticleEntries(articlesDirectory);

    cleanGeneratedPages();
    writePages(compiled, articleIndex, devAssetManifest);

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
        }
        throw new Error(`Build failed: ${failed.length} page(s) had errors`);
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(`built ${compiled.length} pages in ${elapsed}s\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    rebuildContent().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
