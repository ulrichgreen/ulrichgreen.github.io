import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { distDirectory } from "./paths.ts";

export function writeDistFile(
    relativePath: string,
    content: string | Buffer,
): void {
    const fullPath = join(distDirectory, relativePath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content);
}
