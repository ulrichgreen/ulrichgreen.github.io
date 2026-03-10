import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(
    new URL("../docs/mdx-react-direction.md", import.meta.url),
);

if (!existsSync(file)) {
    console.error("mdx-react-direction.md not found");
    process.exit(1);
}

const content = readFileSync(file, "utf8");
const required = [
    "# MDX + React Direction",
    "static-first",
    "pages and articles",
    "typed content module",
    "single-process build entry",
    "zod",
    "layout registry",
    "remark-gfm",
    "remark-directive",
    "rehype-autolink-headings",
    "rehype-pretty-code",
    "shiki",
    "content-components.tsx",
    "hydrateRoot",
    "No full-page hydration",
    "Migration Order",
];

const errors = required.filter((item) => !content.includes(item));

if (errors.length > 0) {
    console.error("mdx-react-direction.md verification failed:");
    errors.forEach((item) => console.error(`  - Missing: ${item}`));
    process.exit(1);
}

console.log(
    `mdx-react-direction.md verified: ${required.length} MDX-and-React direction anchors present.`,
);
