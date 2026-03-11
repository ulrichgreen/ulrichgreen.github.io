import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distDirectory = fileURLToPath(new URL("../../dist", import.meta.url));

export interface AssetManifest {
    "style.css": string;
    "site.js": string;
    "islands.js": string;
}

function contentHash(filePath: string): string {
    if (!existsSync(filePath)) {
        throw new Error(`Asset not found: ${filePath}. Was the upstream build step skipped?`);
    }
    const content = readFileSync(filePath);
    return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

export function generateAssetManifest(): AssetManifest {
    return {
        "style.css": `style.${contentHash(join(distDirectory, "style.css"))}.css`,
        "site.js": `site.${contentHash(join(distDirectory, "site.js"))}.js`,
        "islands.js": `islands.${contentHash(join(distDirectory, "islands.js"))}.js`,
    };
}

export function applyHashedFilenames(manifest: AssetManifest): void {
    for (const [original, hashed] of Object.entries(manifest)) {
        const originalPath = join(distDirectory, original);
        if (!existsSync(originalPath)) {
            throw new Error(`Cannot rename missing asset: ${originalPath}`);
        }
        renameSync(originalPath, join(distDirectory, hashed));
    }
}
