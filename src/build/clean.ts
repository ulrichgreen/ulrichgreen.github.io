import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { distDirectory } from "./paths.ts";

export function cleanDist(): void {
    rmSync(distDirectory, {
        force: true,
        recursive: true,
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    cleanDist();
}
