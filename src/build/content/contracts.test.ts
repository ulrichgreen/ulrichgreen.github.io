import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { h } from "preact";
import { validateContentContracts } from "./contracts.ts";
import type { ArticleIndexEntry, BuiltContent } from "../../types/content.ts";

function article(overrides: Partial<ArticleIndexEntry> & { slug: string }): ArticleIndexEntry {
    return {
        layout: "article",
        title: overrides.slug,
        published: "2025-01-01",
        href: `/articles/${overrides.slug}.html`,
        sourcePath: `/content/articles/${overrides.slug}.mdx`,
        ...overrides,
    };
}

function built(sourcePath: string): BuiltContent {
    return {
        meta: {
            layout: sourcePath.includes("/articles/") ? "article" : "base",
            title: "Test",
            ...(sourcePath.includes("/articles/")
                ? { published: "2025-01-01" }
                : {}),
        } as BuiltContent["meta"],
        Content: () => h("div", null, "Body"),
        headings: [],
        sourcePath,
    };
}

describe("validateContentContracts", () => {
    it("rejects duplicate article slugs", () => {
        assert.throws(
            () =>
                validateContentContracts({
                    articleIndex: [
                        article({ slug: "same", sourcePath: "/a/same.mdx" }),
                        article({ slug: "same", sourcePath: "/b/same.mdx" }),
                    ],
                    builtContent: [],
                }),
            /Duplicate article slug "same"/,
        );
    });

    it("rejects non-canonical content source paths", () => {
        assert.throws(
            () =>
                validateContentContracts({
                    articleIndex: [],
                    builtContent: [built("/site/content/articles/Bad_Slug.mdx")],
                    contentDirectory: "/site/content",
                }),
            /Use lowercase kebab-case content paths/,
        );
    });

    it("requires contiguous series order values", () => {
        assert.throws(
            () =>
                validateContentContracts({
                    articleIndex: [
                        article({
                            slug: "part-one",
                            series: "Series",
                            seriesOrder: 1,
                        }),
                        article({
                            slug: "part-three",
                            series: "Series",
                            seriesOrder: 3,
                        }),
                    ],
                    builtContent: [],
                }),
            /Series "Series" should use contiguous seriesOrder values/,
        );
    });

    it("rejects missing local image references", () => {
        const directory = mkdtempSync(join(tmpdir(), "content-contracts-"));
        const contentDirectory = join(directory, "content");
        const imagesDirectory = join(directory, "src/images");
        const pagePath = join(contentDirectory, "page.mdx");
        mkdirSync(contentDirectory, { recursive: true });
        mkdirSync(imagesDirectory, { recursive: true });
        writeFileSync(pagePath, '<Figure src="/images/missing.png" />');

        try {
            assert.throws(
                () =>
                    validateContentContracts({
                        articleIndex: [],
                        builtContent: [built(pagePath)],
                        contentDirectory,
                        imagesDirectory,
                    }),
                /Missing image reference "\/images\/missing\.png"/,
            );
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});
