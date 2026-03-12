import { writeDistFile } from "./dist-fs.ts";

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

    writeDistFile("_headers", headers);
}
