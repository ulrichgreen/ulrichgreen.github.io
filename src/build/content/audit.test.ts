import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { h } from "preact";
import {
    createContentAudit,
    formatContentAuditReport,
} from "./audit.ts";
import type { ArticleIndexEntry, BuiltContent } from "../../types/content.ts";

function content(overrides: Partial<BuiltContent>): BuiltContent {
    return {
        meta: { title: "Page", layout: "base" },
        Content: () => h("div", null, "Body"),
        headings: [],
        sourcePath: "/content/page.mdx",
        ...overrides,
    };
}

function article(overrides: Partial<ArticleIndexEntry> & { slug: string }): ArticleIndexEntry {
    return {
        ...overrides,
        title: overrides.slug,
        slug: overrides.slug,
        href: `/articles/${overrides.slug}.html`,
        sourcePath: `/content/articles/${overrides.slug}.mdx`,
        layout: "article",
        published: "2025-01-01",
    };
}

describe("createContentAudit", () => {
    it("summarizes descriptions, drafts, stale articles, series gaps, words, and images", () => {
        const audit = createContentAudit({
            builtContent: [
                content({
                    meta: {
                        title: "Missing",
                        layout: "base",
                        words: 100,
                    },
                    sourcePath: "/content/missing.mdx",
                }),
                content({
                    meta: {
                        title: "Draft",
                        layout: "article",
                        published: "2025-01-01",
                        draft: true,
                        description: "Draft description",
                        words: 200,
                    },
                    sourcePath: "/content/articles/draft.mdx",
                }),
            ],
            articleIndex: [
                article({
                    slug: "part-one",
                    series: "Series",
                    seriesOrder: 1,
                    words: 300,
                    published: "2024-01-01",
                }),
                article({
                    slug: "part-three",
                    series: "Series",
                    seriesOrder: 3,
                    words: 500,
                    published: "2024-01-03",
                }),
            ],
            sourceTextByPath: new Map([
                ["/content/missing.mdx", '<Figure src="/images/a.png" />'],
                ["/content/articles/draft.mdx", "No image"],
            ]),
            now: new Date("2026-04-25T00:00:00Z"),
        });

        assert.equal(audit.pageCount, 2);
        assert.equal(audit.draftArticles.length, 1);
        assert.equal(audit.missingDescriptions.length, 1);
        assert.equal(audit.staleArticles.length, 2);
        assert.deepEqual(audit.seriesGaps, [
            { series: "Series", expected: 2, found: 3 },
        ]);
        assert.equal(audit.wordCount.total, 300);
        assert.equal(audit.wordCount.averageArticle, 400);
        assert.equal(audit.imageReferences.length, 1);
    });
});

describe("formatContentAuditReport", () => {
    it("renders a compact read-only report", () => {
        const report = formatContentAuditReport({
            pageCount: 1,
            articleCount: 1,
            draftArticles: [],
            missingDescriptions: ["/content/page.mdx"],
            staleArticles: ["old"],
            seriesGaps: [{ series: "Series", expected: 2, found: 3 }],
            wordCount: { total: 500, averageArticle: 500 },
            imageReferences: ["/images/a.png"],
        });

        assert.match(report, /content audit/);
        assert.match(report, /descriptions 1 missing/);
        assert.match(report, /series gaps Series expected 2 before 3/);
        assert.match(report, /images 1 references/);
    });
});
