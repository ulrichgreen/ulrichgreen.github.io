import sharp from "sharp";
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
} from "node:fs";
import { extname, join, basename } from "node:path";
import { distDirectory } from "../shared/paths.ts";

const imagesDir = new URL("../../images", import.meta.url).pathname;
const distImagesDir = join(distDirectory, "images");

const RASTER_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const PASSTHROUGH_EXTS = new Set([".svg", ".avif", ".webp"]);

interface ProcessedImage {
    source: string;
    outputs: string[];
}

async function processImage(
    sourcePath: string,
    destDir: string,
): Promise<ProcessedImage> {
    const name = basename(sourcePath, extname(sourcePath));
    const ext = extname(sourcePath).toLowerCase();
    const outputs: string[] = [];

    // Always copy the original
    const destOriginal = join(destDir, basename(sourcePath));
    copyFileSync(sourcePath, destOriginal);
    outputs.push(destOriginal);

    if (!RASTER_EXTS.has(ext)) {
        return { source: sourcePath, outputs };
    }

    const image = sharp(sourcePath);
    const metadata = await image.metadata();

    // Generate WebP variant
    const webpPath = join(destDir, `${name}.webp`);
    await sharp(sourcePath)
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);
    outputs.push(webpPath);

    // Generate AVIF variant
    const avifPath = join(destDir, `${name}.avif`);
    await sharp(sourcePath)
        .avif({ quality: 65, effort: 6 })
        .toFile(avifPath);
    outputs.push(avifPath);

    // Generate a smaller variant if image is large (> 640px wide)
    if (metadata.width && metadata.width > 640) {
        const smallWidth = Math.round(metadata.width / 2);

        const smallWebpPath = join(destDir, `${name}-${smallWidth}w.webp`);
        await sharp(sourcePath)
            .resize(smallWidth)
            .webp({ quality: 80, effort: 6 })
            .toFile(smallWebpPath);
        outputs.push(smallWebpPath);

        const smallAvifPath = join(destDir, `${name}-${smallWidth}w.avif`);
        await sharp(sourcePath)
            .resize(smallWidth)
            .avif({ quality: 65, effort: 6 })
            .toFile(smallAvifPath);
        outputs.push(smallAvifPath);
    }

    return { source: sourcePath, outputs };
}

export async function buildImages(): Promise<void> {
    if (!existsSync(imagesDir)) return;

    mkdirSync(distImagesDir, { recursive: true });

    const allExts = new Set([...RASTER_EXTS, ...PASSTHROUGH_EXTS]);
    const files = readdirSync(imagesDir).filter((f) =>
        allExts.has(extname(f).toLowerCase()),
    );

    const results = await Promise.all(
        files.map((file) => processImage(join(imagesDir, file), distImagesDir)),
    );

    const totalOutputs = results.reduce((sum, r) => sum + r.outputs.length, 0);
    process.stdout.write(
        `  images: ${files.length} source → ${totalOutputs} output files\n`,
    );
}
