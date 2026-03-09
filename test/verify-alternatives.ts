import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/ALTERNATIVES.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("ALTERNATIVES.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "Astro",
    "Eleventy",
    "Native ES Modules",
    "CSS Layers",
    "Container Queries",
    "Zod",
    "Verdict",
    "manifesto",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("ALTERNATIVES.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `ALTERNATIVES.md verified: ${required.length} alternative anchors present.`,
);
