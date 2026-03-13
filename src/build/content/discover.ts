import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import {
    contentDirectory,
    distDirectory,
    writingDirectory,
} from "../shared/paths.ts";

export function discoverSourceFiles(): string[] {
    const topLevelPages = readdirSync(contentDirectory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => join(contentDirectory, file));
    const writingPages = readdirSync(writingDirectory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => join(writingDirectory, file));
    return [...topLevelPages, ...writingPages];
}

export function resolveOutputPath(sourcePath: string): string {
    return join(
        distDirectory,
        relative(contentDirectory, sourcePath).replace(/\.mdx$/, ".html"),
    );
}

export function cleanGeneratedPages(): void {
    mkdirSync(distDirectory, { recursive: true });
    for (const entry of readdirSync(distDirectory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(".html")) {
            rmSync(join(distDirectory, entry.name), { force: true });
        }
    }
    rmSync(join(distDirectory, "writing"), { recursive: true, force: true });
}
