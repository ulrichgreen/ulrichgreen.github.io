import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/EXPERIMENTS.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("EXPERIMENTS.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "Load full experience",
    "Flash",
    "prefers-reduced-motion",
    "Return to reality",
    "readable",
    "SVG social cards",
    "404 page",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("EXPERIMENTS.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `EXPERIMENTS.md verified: ${required.length} experiment anchors present.`,
);
