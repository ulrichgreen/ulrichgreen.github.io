import { applyHashedFilenames, generateAssetManifest } from "./asset-manifest.ts";
import { buildClient } from "./client.ts";
import { buildCss } from "./css.ts";
import { buildSite } from "./site.ts";

export async function buildAll(): Promise<void> {
    await buildCss();
    await buildClient();
    const manifest = generateAssetManifest();
    await buildSite(manifest);
    applyHashedFilenames(manifest);
}

buildAll().catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exit(1);
});