import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { resolveOutputPath } from "./discover.ts";
import { contentDirectory, distDirectory } from "../shared/paths.ts";

describe("resolveOutputPath", () => {
    it("maps a top-level MDX file to its HTML counterpart in dist", () => {
        const source = join(contentDirectory, "index.mdx");
        const expected = join(distDirectory, "index.html");
        assert.equal(resolveOutputPath(source), expected);
    });

    it("maps an article MDX file preserving the articles/ subdirectory", () => {
        const source = join(contentDirectory, "articles", "on-constraints.mdx");
        const expected = join(distDirectory, "articles", "on-constraints.html");
        assert.equal(resolveOutputPath(source), expected);
    });

    it("only changes the .mdx extension, not the filename", () => {
        const source = join(contentDirectory, "colophon.mdx");
        const result = resolveOutputPath(source);
        assert.ok(result.endsWith("colophon.html"));
        assert.ok(!result.endsWith(".mdx"));
    });
});
