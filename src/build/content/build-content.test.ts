import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMetaDescription } from "./build-content.ts";
import type { FrontmatterPayload, BasePageMeta } from "../../types/content.ts";

function payload(
    body: string,
    meta: Partial<BasePageMeta> = {},
): FrontmatterPayload {
    return {
        body,
        meta: {
            title: "Test Title",
            layout: "base" as const,
            ...meta,
        },
    };
}

describe("resolveMetaDescription", () => {
    describe("explicit description", () => {
        it("uses the frontmatter description field when present", () => {
            const result = resolveMetaDescription(
                payload("Some body", { description: "Explicit description." }),
            );
            assert.equal(result, "Explicit description.");
        });

        it("falls back to frontmatter summary when description is absent", () => {
            const result = resolveMetaDescription(
                payload("Some body", { summary: "Summary text." }),
            );
            assert.equal(result, "Summary text.");
        });

        it("prefers description over summary", () => {
            const result = resolveMetaDescription(
                payload("Some body", {
                    description: "The description.",
                    summary: "The summary.",
                }),
            );
            assert.equal(result, "The description.");
        });
    });

    describe("extracted from body", () => {
        it("returns the first prose paragraph", () => {
            const result = resolveMetaDescription(
                payload("First paragraph.\n\nSecond paragraph."),
            );
            assert.equal(result, "First paragraph.");
        });

        it("skips a heading that matches the page title", () => {
            const result = resolveMetaDescription(
                payload("# Test Title\n\nActual description here."),
            );
            assert.equal(result, "Actual description here.");
        });

        it("strips markdown link syntax", () => {
            const result = resolveMetaDescription(
                payload("See [the docs](https://example.com) for more."),
            );
            assert.equal(result, "See the docs for more.");
        });

        it("strips inline code backticks, keeping the text", () => {
            const result = resolveMetaDescription(
                payload("Use `tsx` to run the build."),
            );
            assert.equal(result, "Use tsx to run the build.");
        });

        it("strips fenced code blocks entirely", () => {
            const result = resolveMetaDescription(
                payload("```js\nconst x = 1;\n```\n\nThe real description."),
            );
            assert.equal(result, "The real description.");
        });

        it("truncates long body paragraphs with an ellipsis", () => {
            const longParagraph = "word ".repeat(50).trim();
            const result = resolveMetaDescription(payload(longParagraph));
            assert.ok(result?.endsWith("..."), "should end with ...");
            assert.ok(
                result !== undefined && result.length <= 165,
                "should be near 160 chars",
            );
        });

        it("returns undefined when the body is empty", () => {
            const result = resolveMetaDescription(payload(""));
            assert.equal(result, undefined);
        });
    });
});
