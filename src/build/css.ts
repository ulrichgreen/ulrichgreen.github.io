import { bundle } from "lightningcss";
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const source = new URL("../styles/style.css", import.meta.url).pathname;
const distDir = new URL("../../dist", import.meta.url).pathname;
const destination = new URL("../../dist/style.css", import.meta.url).pathname;
const fontsDir = new URL("../fonts", import.meta.url).pathname;
const distFontsDir = join(distDir, "fonts");

mkdirSync(distDir, { recursive: true });
mkdirSync(distFontsDir, { recursive: true });

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

for (const file of readdirSync(fontsDir).filter((f) => f.endsWith(".woff2"))) {
    copyFileSync(join(fontsDir, file), join(distFontsDir, file));
}
process.stdout.write(
    `css.ts: copied fonts to dist/fonts/\n`,
);
