import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import {
    formatBuildSummary,
    listLargestOutputFiles,
} from "./build-summary.ts";

function bytes(length: number): string {
    return "x".repeat(length);
}

describe("listLargestOutputFiles", () => {
    it("reports the largest output file in each major asset group", () => {
        const directory = mkdtempSync(join(tmpdir(), "build-summary-"));
        try {
            mkdirSync(join(directory, "articles"));
            writeFileSync(join(directory, "index.html"), bytes(1000));
            writeFileSync(join(directory, "articles/post.html"), bytes(2000));
            writeFileSync(join(directory, "style.css"), bytes(3000));
            writeFileSync(join(directory, "site.js"), bytes(4000));
            writeFileSync(join(directory, "photo.webp"), bytes(5000));

            const files = listLargestOutputFiles(directory);

            assert.equal(files.find((file) => file.label === "HTML")?.path, "articles/post.html");
            assert.equal(files.find((file) => file.label === "CSS")?.path, "style.css");
            assert.equal(files.find((file) => file.label === "JS")?.path, "site.js");
            assert.equal(files.find((file) => file.label === "Images")?.path, "photo.webp");
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});

describe("formatBuildSummary", () => {
    it("renders counts, asset sizes, island usage, and largest files", () => {
        const report = formatBuildSummary({
            pageCount: 10,
            articleCount: 6,
            feedEntries: 6,
            imageSummary: { sourceCount: 2, outputCount: 6 },
            cssBytes: 1024,
            jsBytes: 2048,
            islandPages: 1,
            islands: { DemoWidget: 1, TableOfContents: 1 },
            largestFiles: [
                { label: "HTML", path: "articles/post.html", bytes: 4096 },
            ],
        });

        assert.match(report, /pages 10 total, 6 articles, 6 feed entries/);
        assert.match(report, /assets CSS 1\.0 KiB, JS 2\.0 KiB/);
        assert.match(report, /images 2 source → 6 output files/);
        assert.match(report, /islands 1 page, DemoWidget×1, TableOfContents×1/);
        assert.match(report, /HTML\s+4\.0 KiB\s+articles\/post\.html/);
    });
});
