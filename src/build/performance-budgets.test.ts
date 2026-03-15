import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import {
    formatPerformanceBudgetReport,
    measurePerformanceBudgets,
    type PerformanceBudget,
} from "./performance-budgets.ts";

function bytes(size: number): Buffer {
    return Buffer.alloc(size, "a");
}

describe("measurePerformanceBudgets", () => {
    it("sums matching files recursively and ignores other asset types", () => {
        const directory = mkdtempSync(join(tmpdir(), "budget-test-"));
        try {
            mkdirSync(join(directory, "nested"));
            writeFileSync(join(directory, "index.html"), bytes(1000));
            writeFileSync(join(directory, "nested", "article.html"), bytes(2000));
            writeFileSync(join(directory, "style.css"), bytes(512));
            writeFileSync(join(directory, "nested", "site.js"), bytes(2048));
            writeFileSync(join(directory, "nested", "body.woff2"), bytes(4096));
            writeFileSync(join(directory, "nested", "photo.png"), bytes(9999));

            const budgets: PerformanceBudget[] = [
                {
                    label: "HTML",
                    extensions: [".html"],
                    warnAtBytes: 2500,
                    maximumBytes: 4000,
                },
                {
                    label: "CSS",
                    extensions: [".css"],
                    warnAtBytes: 256,
                    maximumBytes: 1024,
                },
                {
                    label: "JS",
                    extensions: [".js"],
                    warnAtBytes: 1024,
                    maximumBytes: 4096,
                },
                {
                    label: "Fonts",
                    extensions: [".woff2"],
                    warnAtBytes: 2048,
                    maximumBytes: 8192,
                },
            ];

            const results = measurePerformanceBudgets(directory, budgets);

            assert.deepEqual(
                results.map(({ label, bytes, status }) => ({
                    label,
                    bytes,
                    status,
                })),
                [
                    { label: "HTML", bytes: 3000, status: "warn" },
                    { label: "CSS", bytes: 512, status: "warn" },
                    { label: "JS", bytes: 2048, status: "warn" },
                    { label: "Fonts", bytes: 4096, status: "warn" },
                ],
            );
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });

    it("marks budgets as failed once they exceed the maximum", () => {
        const directory = mkdtempSync(join(tmpdir(), "budget-test-"));
        try {
            writeFileSync(join(directory, "bundle.js"), bytes(5000));

            const [result] = measurePerformanceBudgets(directory, [
                {
                    label: "JS",
                    extensions: [".js"],
                    warnAtBytes: 3000,
                    maximumBytes: 4096,
                },
            ]);

            assert.equal(result.status, "fail");
            assert.equal(result.bytes, 5000);
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
});

describe("formatPerformanceBudgetReport", () => {
    it("renders user-friendly output for pass, warn, and fail states", () => {
        const report = formatPerformanceBudgetReport([
            {
                label: "HTML",
                extensions: [".html"],
                warnAtBytes: 10 * 1024,
                maximumBytes: 20 * 1024,
                bytes: 8 * 1024,
                status: "pass",
            },
            {
                label: "CSS",
                extensions: [".css"],
                warnAtBytes: 10 * 1024,
                maximumBytes: 20 * 1024,
                bytes: 12 * 1024,
                status: "warn",
            },
            {
                label: "JS",
                extensions: [".js"],
                warnAtBytes: 10 * 1024,
                maximumBytes: 20 * 1024,
                bytes: 25 * 1024,
                status: "fail",
            },
        ]);

        assert.match(report, /^performance budgets/m);
        assert.match(report, /✓ HTML\s+8\.0 KiB \/ 20\.0 KiB/);
        assert.match(report, /! CSS\s+12\.0 KiB \/ 20\.0 KiB/);
        assert.match(report, /✕ JS\s+25\.0 KiB \/ 20\.0 KiB \(\+5\.0 KiB\)/);
    });
});
