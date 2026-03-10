import { existsSync, readFileSync } from "node:fs";

const file = new URL("../docs/ARCHITECTURE.md", import.meta.url).pathname;

if (!existsSync(file)) {
    console.error("ARCHITECTURE.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "make build",
    "frontmatter.ts",
    "build-content.ts",
    "compile-mdx.ts",
    "render-react-page.tsx",
    "renderToStaticMarkup",
    "hydrateRoot",
    "section: writing",
    "progressive enhancement",
    "content-components.tsx",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("ARCHITECTURE.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `ARCHITECTURE.md verified: ${required.length} implementation anchors present.`,
);
