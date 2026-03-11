import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL } from "../config.ts";
const distDirectory = fileURLToPath(new URL("../../dist", import.meta.url));

export function buildRobots(): void {
    const content = [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
    ].join("\n");

    mkdirSync(distDirectory, { recursive: true });
    writeFileSync(join(distDirectory, "robots.txt"), content);
}
