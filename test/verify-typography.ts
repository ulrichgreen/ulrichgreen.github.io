import { existsSync, readFileSync } from "node:fs";

const file = new URL("../typography.html", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("typography.html not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const errors: string[] = [];

const fontStacks = [
    "ui-serif",
    "georgia",
    "charter",
    "palatino",
    "optima",
    "system-ui",
];

for (const stack of fontStacks) {
    if (!content.includes(`data-font="${stack}"`)) {
        errors.push(`Missing font stack: data-font="${stack}"`);
    }
}

const gridFeatures = ["--u:", "show-grid", "js-grid-btn", "toggleGrid"];
for (const feature of gridFeatures) {
    if (!content.includes(feature)) {
        errors.push(`Missing baseline grid feature: "${feature}"`);
    }
}

const darkModeFeatures = ["prefers-color-scheme", "data-theme", "js-theme-btn"];
for (const feature of darkModeFeatures) {
    if (!content.includes(feature)) {
        errors.push(`Missing dark mode feature: "${feature}"`);
    }
}

const gridValues = ["--lh-3u", "--lh-4u", "--lh-5u", "--lh-7u"];
for (const value of gridValues) {
    if (!content.includes(value)) {
        errors.push(`Missing baseline grid line-height variable: "${value}"`);
    }
}

if (!content.includes("specimen")) {
    errors.push("Missing type specimen section");
}

if (!content.includes("data-font-id")) {
    errors.push("Missing font-switcher button attribute data-font-id");
}

if (!content.includes("e.key === 'b'") && !content.includes('e.key === "b"')) {
    errors.push("Missing keyboard shortcut for baseline grid toggle (B key)");
}

const externalPattern = /(?:href|src|url)\s*=\s*["']https?:\/\//gi;
const externalMatches = content.match(externalPattern);
if (externalMatches) {
    errors.push(
        `Found external URL references (zero external deps required): ${externalMatches.join(", ")}`,
    );
}

if (!content.includes("prefers-reduced-motion")) {
    errors.push("Missing prefers-reduced-motion media query");
}

if (errors.length > 0) {
    console.error("typography.html verification failed:");
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
}

console.log(
    `typography.html verified: ${fontStacks.length} font stacks, ${gridValues.length} grid line-heights, grid overlay, dark mode, type specimen, zero external deps.`,
);
