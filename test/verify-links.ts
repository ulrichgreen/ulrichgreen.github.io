import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const distDir = new URL("../dist", import.meta.url).pathname;

function collectHtmlFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectHtmlFiles(fullPath));
        } else if (entry.name.endsWith(".html")) {
            files.push(fullPath);
        }
    }
    return files;
}

function extractLinks(html: string): string[] {
    const pattern = /(?:href|src)="([^"]+)"/g;
    const links: string[] = [];
    let match;
    while ((match = pattern.exec(html)) !== null) {
        links.push(match[1]);
    }
    return links;
}

function isInternalLink(link: string): boolean {
    if (!link.startsWith("/")) return false;
    if (link.startsWith("//")) return false;
    return true;
}

function resolveDistPath(link: string): string {
    const base = link.split("#")[0].split("?")[0];
    if (base === "/") return join(distDir, "index.html");
    return join(distDir, base);
}

const htmlFiles = collectHtmlFiles(distDir);
const broken: { file: string; link: string }[] = [];

for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const links = extractLinks(html);
    const relativePath = file.replace(distDir, "");

    for (const link of links) {
        if (!isInternalLink(link)) continue;

        // Skip data URIs that happen to start with /
        if (link.includes("data:")) continue;

        const target = resolveDistPath(link);
        if (!existsSync(target)) {
            broken.push({ file: relativePath, link });
        }
    }
}

if (broken.length > 0) {
    console.error("Broken internal links found:");
    for (const { file, link } of broken) {
        console.error(`  ${file} → ${link}`);
    }
    process.exit(1);
}

console.log(`Link check passed: ${htmlFiles.length} HTML files, no broken internal links.`);
