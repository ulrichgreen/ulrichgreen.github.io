import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "./frontmatter.ts";
import type { ArticleIndexEntry, BuiltContent, PageMeta } from "../../types/content.ts";
import { isArticleMeta } from "../../types/content.ts";

function toArticleIndexEntry(
    meta: PageMeta,
    sourcePath: string,
): ArticleIndexEntry | undefined {
    if (!isArticleMeta(meta)) {
        return undefined;
    }

    const slug = sourcePath.split("/").pop()?.replace(/\.mdx$/, "") || "";

    return {
        ...meta,
        title: String(meta.title || ""),
        published: String(meta.published || ""),
        slug,
        href: `/articles/${slug}.html`,
        sourcePath,
        draft: meta.draft,
        series: meta.series,
        seriesOrder: meta.seriesOrder,
    } satisfies ArticleIndexEntry;
}

function filterAndSortArticleEntries(
    allEntries: ArticleIndexEntry[],
): ArticleIndexEntry[] {
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

export function listArticleEntries(directory: string): ArticleIndexEntry[] {
    const allEntries = readdirSync(directory)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => {
            const sourcePath = join(directory, file);
            const raw = readFileSync(sourcePath, "utf8");
            const { meta } = parseFrontmatter(raw, sourcePath);
            return toArticleIndexEntry(meta, sourcePath);
        });

    return filterAndSortArticleEntries(
        allEntries.filter(
            (entry): entry is ArticleIndexEntry => entry !== undefined,
        ),
    );
}

export function listArticleEntriesFromBuiltContent(
    builtContent: BuiltContent[],
): ArticleIndexEntry[] {
    return filterAndSortArticleEntries(
        builtContent
            .map((page) => toArticleIndexEntry(page.meta, page.sourcePath))
            .filter((entry): entry is ArticleIndexEntry => entry !== undefined),
    );
}
