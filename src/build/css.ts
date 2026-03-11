import { bundle } from "lightningcss";
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { BROWSER_TARGETS } from "../config.ts";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const source = new URL("../styles/style.css", import.meta.url).pathname;
const distDir = new URL("../../dist", import.meta.url).pathname;
const destination = new URL("../../dist/style.css", import.meta.url).pathname;
const fontsDir = new URL("../fonts", import.meta.url).pathname;
const distFontsDir = join(distDir, "fonts");

export function buildCss(): void {
    mkdirSync(distDir, { recursive: true });
    mkdirSync(distFontsDir, { recursive: true });

    const { code } = bundle({
        filename: source,
        minify: true,
        targets: {
            chrome: BROWSER_TARGETS.chrome << 16,
            firefox: BROWSER_TARGETS.firefox << 16,
            safari: BROWSER_TARGETS.safari << 16,
        },
    });

    writeFileSync(destination, code);
    process.stdout.write(
        `css.ts: wrote ${code.length} bytes to dist/style.css\n`,
    );

    for (const file of readdirSync(fontsDir).filter((f) =>
        f.endsWith(".woff2"),
    )) {
        copyFileSync(join(fontsDir, file), join(distFontsDir, file));
    }

    process.stdout.write(`css.ts: copied fonts to dist/fonts/\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildCss();
}
