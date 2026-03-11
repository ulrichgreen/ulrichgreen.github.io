import { SITE_URL } from "../config.ts";
import { writeDistFile } from "./dist-fs.ts";

export function buildRobots(): void {
    const content = [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
    ].join("\n");

    writeDistFile("robots.txt", content);
}
