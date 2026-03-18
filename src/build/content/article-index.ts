import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import type { ArticleIndexEntry } from "../../types/content.ts";
import { isArticleMeta } from "../../types/content.ts";

export function listArticleEntries(directory: string): ArticleIndexEntry[] {
    const allEntries = readdirSync(directory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
            const sourcePath = join(directory, file);
            const raw = readFileSync(sourcePath, "utf8");
            const { meta } = parseFrontmatter(raw, sourcePath);
            const slug = file.replace(/\.mdx$/, "");

            return {
                ...meta,
                layout: "article" as const,
                title: String(meta.title || ""),
                published: String(meta.published || ""),
                slug,
                href: `/articles/${slug}.html`,
                sourcePath,
                draft: isArticleMeta(meta) ? meta.draft : undefined,
                series: isArticleMeta(meta) ? meta.series : undefined,
                seriesOrder: isArticleMeta(meta) ? meta.seriesOrder : undefined,
            } satisfies ArticleIndexEntry;
        });

    const filtered = allEntries.filter(
        (entry) =>
            entry.draft !== true &&
            Boolean(entry.title) &&
            entry.published &&
            !Number.isNaN(new Date(entry.published).getTime()),
    );

    const invalid = allEntries.filter(
        (entry) =>
            entry.draft !== true &&
            (!entry.title ||
                !entry.published ||
                Number.isNaN(new Date(entry.published).getTime())),
    );
    if (invalid.length > 0) {
        for (const entry of invalid) {
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
