import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "./frontmatter.ts";

describe("parseFrontmatter", () => {
    describe("valid input", () => {
        it("parses a minimal base page", () => {
            const result = parseFrontmatter(`---
title: Hello
---
Body text`);
            assert.equal(result.meta.title, "Hello");
            assert.equal(result.meta.layout, "base");
            assert.equal(result.body.trim(), "Body text");
        });

        it("parses an article with all fields", () => {
            const result = parseFrontmatter(`---
title: My Article
layout: article
section: writing
published: "2025-01-15"
revised: "2025-03-01"
description: A short description
---
Content here`);
            assert.equal(result.meta.title, "My Article");
            assert.equal(result.meta.layout, "article");
            assert.equal(result.meta.section, "writing");
            assert.equal(result.meta.published, "2025-01-15");
            assert.equal(result.meta.revised, "2025-03-01");
            assert.equal(result.meta.description, "A short description");
        });

        it("defaults layout to base when omitted", () => {
            const result = parseFrontmatter("---\ntitle: No Layout\n---\n");
            assert.equal(result.meta.layout, "base");
        });

        it("coerces YAML Date objects to YYYY-MM-DD strings", () => {
            // gray-matter parses unquoted date values as JS Date objects
            const result = parseFrontmatter(`---
title: Date Test
layout: article
published: 2025-06-01
---`);
            assert.equal(result.meta.published, "2025-06-01");
        });

        it("separates frontmatter body from content body", () => {
            const result = parseFrontmatter(`---
title: Split Test
---
# Heading

Paragraph one.`);
            assert.ok(result.body.includes("# Heading"));
            assert.ok(result.body.includes("Paragraph one."));
            assert.ok(!result.body.includes("title:"));
        });

        it("parses series and seriesOrder fields", () => {
            const result = parseFrontmatter(`---
title: Series Part
layout: article
published: "2025-07-01"
series: Building a Design System
seriesOrder: 2
---
Content`);
            assert.equal(result.meta.layout, "article");
            if (result.meta.layout === "article") {
                assert.equal(result.meta.series, "Building a Design System");
                assert.equal(result.meta.seriesOrder, 2);
            }
        });

        it("allows series without seriesOrder", () => {
            const result = parseFrontmatter(`---
title: Series Part
layout: article
published: "2025-07-01"
series: My Series
---
Content`);
            assert.equal(result.meta.layout, "article");
            if (result.meta.layout === "article") {
                assert.equal(result.meta.series, "My Series");
                assert.equal(result.meta.seriesOrder, undefined);
            }
        });

        it("parses revisions array", () => {
            const result = parseFrontmatter(`---
title: Revised Article
layout: article
published: "2025-01-15"
revisions:
  - date: "2025-03-02"
    note: Rewrote the third section
  - date: "2025-02-10"
    note: Added closing argument
---
Content`);
            assert.equal(result.meta.layout, "article");
            if (result.meta.layout === "article") {
                assert.ok(result.meta.revisions);
                assert.equal(result.meta.revisions.length, 2);
                assert.equal(result.meta.revisions[0].date, "2025-03-02");
                assert.equal(result.meta.revisions[0].note, "Rewrote the third section");
            }
        });
    });

    describe("validation errors", () => {
        it("throws on empty input", () => {
            assert.throws(() => parseFrontmatter("   "), /input is empty/);
        });

        it("throws when title is missing", () => {
            assert.throws(
                () => parseFrontmatter("---\nlayout: base\n---\n"),
                /title/,
            );
        });

        it("throws when article layout is missing published", () => {
            assert.throws(
                () =>
                    parseFrontmatter(`---
title: Draft
layout: article
---`),
                /published is required/,
            );
        });

        it("throws on unknown layout value", () => {
            assert.throws(() =>
                parseFrontmatter(`---
title: Bad Layout
layout: unknown
---`),
            );
        });

        it("includes the file path in the error message", () => {
            assert.throws(
                () =>
                    parseFrontmatter(
                        "---\nlayout: base\n---\n",
                        "content/test.mdx",
                    ),
                /content\/test\.mdx/,
            );
        });
    });
});
