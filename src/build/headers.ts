import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distDirectory = fileURLToPath(new URL("../../dist", import.meta.url));

export function buildHeaders(): void {
    const headers = [
        "/*.css",
        "  Cache-Control: public, max-age=31536000, immutable",
        "",
        "/*.js",
        "  Cache-Control: public, max-age=31536000, immutable",
        "",
        "/fonts/*",
        "  Cache-Control: public, max-age=31536000, immutable",
        "",
    ].join("\n");

    mkdirSync(distDirectory, { recursive: true });
    writeFileSync(join(distDirectory, "_headers"), headers);
}
