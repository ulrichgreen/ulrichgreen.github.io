import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { listArticleEntries } from "./article-index.ts";

function writeArticle(
    directory: string,
    fileName: string,
    frontmatter: string,
): void {
    writeFileSync(join(directory, fileName), `${frontmatter}\nBody\n`);
}

describe("listArticleEntries", () => {
    it("filters draft articles from the index", () => {
        const directory = mkdtempSync(join(tmpdir(), "article-index-"));

        try {
            writeArticle(
                directory,
                "published.mdx",
                `---
title: Published
layout: article
published: "2025-01-02"
---`,
            );
            writeArticle(
                directory,
                "draft.mdx",
                `---
title: Draft
layout: article
published: "2025-01-03"
draft: true
---`,
            );

            const entries = listArticleEntries(directory);

            assert.equal(entries.length, 1);
            assert.equal(entries[0].title, "Published");
            assert.equal(entries[0].sourcePath, join(directory, "published.mdx"));
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});
