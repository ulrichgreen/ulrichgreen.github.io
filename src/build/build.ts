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
import { compilePages } from "./content/compile-pages.ts";
import {
    cleanGeneratedPages,
    discoverSourceFiles,
} from "./content/discover.ts";
import { writingDirectory } from "./shared/paths.ts";
import { writePages } from "./render/write-pages.ts";
import { listWritingEntries } from "./content/writing-index.ts";

export async function buildAll(options: { dev?: boolean } = {}): Promise<void> {
    const start = performance.now();

    if (!options.dev) cleanDist();
    await Promise.all([buildCss(), buildClient()]);
    const manifest = options.dev ? devAssetManifest : generateAssetManifest();

    const writingIndex = listWritingEntries(writingDirectory);
    const sourceFiles = discoverSourceFiles();
    const { compiled, failed } = await compilePages(sourceFiles);

    cleanGeneratedPages();
    writePages(compiled, writingIndex, manifest);

    if (failed.length > 0) {
        for (const { file, error } of failed) {
            process.stderr.write(`  error  ${file}\n  ${String(error)}\n`);
        }
        throw new Error(`Build failed: ${failed.length} page(s) had errors`);
    }

    const compiledWriting = compiled.filter((c) =>
        c.sourcePath.includes("/writing/"),
    );
    await buildAncillary(writingIndex, compiledWriting);
    if (!options.dev) applyHashedFilenames(manifest);

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(`built ${compiled.length} pages in ${elapsed}s\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildAll().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}
