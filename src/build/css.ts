import { bundle } from "lightningcss";
import { mkdirSync, writeFileSync } from "node:fs";

const source = new URL("../styles/style.css", import.meta.url).pathname;
const distDir = new URL("../../dist", import.meta.url).pathname;
const destination = new URL("../../dist/style.css", import.meta.url).pathname;

mkdirSync(distDir, { recursive: true });

const { code } = bundle({
    filename: source,
    minify: true,
    targets: {
        chrome: 120 << 16,
        firefox: 121 << 16,
        safari: 17 << 16,
    },
});

writeFileSync(destination, code);
process.stdout.write(`css.ts: wrote ${code.length} bytes to dist/style.css\n`);
