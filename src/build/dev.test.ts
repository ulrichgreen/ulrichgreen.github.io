import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { resolveDevServerFilePath } from "./dev.ts";

describe("resolveDevServerFilePath", () => {
    it("ignores query strings while resolving files", () => {
        const directory = mkdtempSync(join(tmpdir(), "dev-server-"));
        try {
            writeFileSync(join(directory, "index.html"), "home");

            const result = resolveDevServerFilePath("/?v=1", directory);

            assert.equal(result.status, 200);
            assert.equal(result.filePath, join(directory, "index.html"));
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it("resolves directory URLs to their index file", () => {
        const directory = mkdtempSync(join(tmpdir(), "dev-server-"));
        try {
            mkdirSync(join(directory, "articles"));
            writeFileSync(join(directory, "articles/index.html"), "articles");

            const result = resolveDevServerFilePath("/articles/", directory);

            assert.equal(result.status, 200);
            assert.equal(result.filePath, join(directory, "articles/index.html"));
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it("rejects traversal outside dist, including encoded traversal", () => {
        const directory = mkdtempSync(join(tmpdir(), "dev-server-"));
        try {
            assert.equal(
                resolveDevServerFilePath("/../package.json", directory).status,
                400,
            );
            assert.equal(
                resolveDevServerFilePath("/%2e%2e/package.json", directory).status,
                400,
            );
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it("rejects malformed encoded URLs", () => {
        const directory = mkdtempSync(join(tmpdir(), "dev-server-"));
        try {
            assert.equal(resolveDevServerFilePath("/%E0%A4%A", directory).status, 400);
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});
