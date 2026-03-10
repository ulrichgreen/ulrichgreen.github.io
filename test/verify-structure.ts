import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/STRUCTURE.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("STRUCTURE.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "content/",
    "src/build/",
    "src/content-components.tsx",
    "src/templates/",
    "src/components/",
    "src/client/",
    "src/islands/",
    "src/styles/",
    "dist/",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("STRUCTURE.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `STRUCTURE.md verified: ${required.length} directory anchors present.`,
);
