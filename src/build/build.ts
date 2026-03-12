import { fileURLToPath } from "node:url";
import { applyHashedFilenames, generateAssetManifest } from "./asset-manifest.ts";
import { buildClient } from "./client.ts";
import { buildCss } from "./css.ts";
import { buildSite } from "./site.ts";

export async function buildAll(): Promise<void> {
    const start = performance.now();

    await Promise.all([buildCss(), buildClient()]);
    const manifest = generateAssetManifest();
    const pageCount = await buildSite(manifest);
    applyHashedFilenames(manifest);

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    process.stdout.write(`build: ${pageCount} pages in ${elapsed}s\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildAll().catch((error) => {
        process.stderr.write(`${String(error)}\n`);
        process.exit(1);
    });
}