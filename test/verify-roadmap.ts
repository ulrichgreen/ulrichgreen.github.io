import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/ROADMAP.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("ROADMAP.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "sitemap.xml",
    "canonical URLs",
    "frontmatter validation",
    "full-text feed",
    "broken-link check",
    "Year-based archives",
    "Not The Goal",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("ROADMAP.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(`ROADMAP.md verified: ${required.length} roadmap items present.`);
