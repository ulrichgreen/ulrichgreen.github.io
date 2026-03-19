import { fileURLToPath } from "node:url";
import { devAssetManifest } from "./assets/asset-manifest.ts";
import {
    listArticleEntries,
    listArticleEntriesFromBuiltContent,
} from "./content/article-index.ts";
import { compilePages } from "./content/compile-pages.ts";
import { discoverSourceFiles } from "./content/discover.ts";
import { writePages } from "./render/write-pages.ts";
import { articlesDirectory } from "./shared/paths.ts";

type RenderScope = "all" | "articles";

function getSourceFilesForScope(scope: RenderScope): string[] {
    const sourceFiles = discoverSourceFiles();

    if (scope === "articles") {
        return sourceFiles.filter((sourcePath) => sourcePath.includes("/articles/"));
    }

    return sourceFiles;
}

export async function rebuildRenderedPages(
    scope: RenderScope = "all",
): Promise<void> {
    const start = performance.now();
    const sourceFiles = getSourceFilesForScope(scope);
    const { compiled, failed } = await compilePages(sourceFiles);
    const articleIndex =
        failed.length === 0
            ? listArticleEntriesFromBuiltContent(compiled)
            : listArticleEntries(articlesDirectory);

    writePages(compiled, articleIndex, devAssetManifest);

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
        }
        throw new Error(`Build failed: ${failed.length} page(s) had errors`);
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(
        `rebuilt ${compiled.length} ${scope === "articles" ? "article " : ""}pages in ${elapsed}s\n`,
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const scope = process.argv[2] === "articles" ? "articles" : "all";
    rebuildRenderedPages(scope).catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}