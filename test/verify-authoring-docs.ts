import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getContentComponents } from "../src/content-components.tsx";

const guidePath = fileURLToPath(
    new URL("../docs/writing-guide.md", import.meta.url),
);
const guide = readFileSync(guidePath, "utf8");
const documentedComponents = [
    ...guide.matchAll(/^### `([^`]+)`/gm),
].map((match) => match[1]);
const registeredComponents = Object.keys(getContentComponents()).sort();

assert.deepEqual(
    documentedComponents.sort(),
    registeredComponents,
    "Every registered MDX component should be documented in docs/writing-guide.md, and every documented component should be registered in src/content-components.tsx.",
);

console.log(
    "Authoring docs verified: writing guide and registered MDX components are in sync.",
);
