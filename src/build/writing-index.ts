import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import type { WritingIndexEntry } from "../types/content.ts";

export function listWritingEntries(directory: string): WritingIndexEntry[] {
    return readdirSync(directory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
            const raw = readFileSync(join(directory, file), "utf8");
            const { meta } = parseFrontmatter(raw);
            const slug = file.replace(/\.mdx$/, "");

            return {
                ...meta,
                title: String(meta.title || ""),
                published: String(meta.published || ""),
                slug,
                href: `/writing/${slug}.html`,
            } satisfies WritingIndexEntry;
        })
        .filter(
            (entry) =>
                Boolean(entry.title) &&
                entry.published &&
                !Number.isNaN(new Date(entry.published).getTime()),
        )
        .sort(
            (left, right) =>
                new Date(right.published).getTime() -
                new Date(left.published).getTime(),
        );
}
