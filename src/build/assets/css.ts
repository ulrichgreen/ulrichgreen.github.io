import { bundle } from "lightningcss";
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { BROWSER_TARGETS } from "../../config.ts";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { distDirectory } from "../shared/paths.ts";

const source = new URL("../../styles/style.css", import.meta.url).pathname;
const destination = join(distDirectory, "style.css");
const fontsDir = new URL("../../fonts", import.meta.url).pathname;
const distFontsDir = join(distDirectory, "fonts");
const imagesDir = new URL("../../images", import.meta.url).pathname;
const distImagesDir = join(distDirectory, "images");

export async function buildCss(): Promise<void> {
    mkdirSync(distDirectory, { recursive: true });
    mkdirSync(distFontsDir, { recursive: true });
    mkdirSync(distImagesDir, { recursive: true });

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

    for (const file of readdirSync(fontsDir).filter((f) =>
        f.endsWith(".woff2"),
    )) {
        copyFileSync(join(fontsDir, file), join(distFontsDir, file));
    }

    // Copy static images (SVG, AVIF, WebP, JPEG, PNG) from src/images/ → dist/images/
    // Place optimised variants alongside the source here; the <Picture> component
    // picks the best format the browser supports at runtime.
    const imageExts = new Set([".svg", ".avif", ".webp", ".jpg", ".jpeg", ".png"]);
    for (const file of readdirSync(imagesDir).filter((f) =>
        imageExts.has(f.slice(f.lastIndexOf("."))),
    )) {
        copyFileSync(join(imagesDir, file), join(distImagesDir, file));
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    buildCss();
}
