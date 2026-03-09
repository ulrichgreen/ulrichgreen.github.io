import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/IMPROVEMENTS.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("IMPROVEMENTS.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "Quick Wins",
    "Medium Effort",
    "Larger Changes",
    "Speculation Rules",
    "View Transitions",
    "Lazy Island Hydration",
    "Frontmatter Validation",
    "Content Hash",
    "Single-Process Build",
    "Performance Budget",
    "What Not To Add",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("IMPROVEMENTS.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `IMPROVEMENTS.md verified: ${required.length} improvement categories present.`,
);
