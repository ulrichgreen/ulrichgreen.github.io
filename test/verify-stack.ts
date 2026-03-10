import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/STACK.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("STACK.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "Make",
    "TypeScript",
    "React",
    "react-dom/server",
    "MDX",
    "gray-matter",
    "lightningcss",
    "esbuild",
    "chokidar",
    "ws",
    "No full-page hydration",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("STACK.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(`STACK.md verified: ${required.length} stack decisions present.`);
