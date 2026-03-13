import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import type { WritingIndexEntry } from "../../types/content.ts";

export function listWritingEntries(directory: string): WritingIndexEntry[] {
    const allEntries = readdirSync(directory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
            const sourcePath = join(directory, file);
            const raw = readFileSync(sourcePath, "utf8");
            const { meta } = parseFrontmatter(raw, sourcePath);
            const slug = file.replace(/\.mdx$/, "");

            return {
                ...meta,
                title: String(meta.title || ""),
                published: String(meta.published || ""),
                slug,
                href: `/writing/${slug}.html`,
            } satisfies WritingIndexEntry;
        });

    const filtered = allEntries.filter(
        (entry) =>
            Boolean(entry.title) &&
            entry.published &&
            !Number.isNaN(new Date(entry.published).getTime()),
    );

    const skipped = allEntries.length - filtered.length;
    if (skipped > 0) {
        const missing = allEntries.filter(
            (entry) =>
                !entry.title ||
                !entry.published ||
                Number.isNaN(new Date(entry.published).getTime()),
        );
        for (const entry of missing) {
            process.stderr.write(
                `  skip  "${entry.slug}" — missing title or published date\n`,
            );
        }
    }

    return filtered.sort(
        (left, right) =>
            new Date(right.published).getTime() -
            new Date(left.published).getTime(),
    );
}
