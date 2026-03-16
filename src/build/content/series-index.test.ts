import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSeriesMap, resolveSeriesInfo } from "./series-index.ts";
import type { ArticleIndexEntry } from "../../types/content.ts";

function entry(
    overrides: Partial<ArticleIndexEntry> & { title: string; slug: string },
): ArticleIndexEntry {
    return {
        layout: "article",
        published: "2025-01-01",
        href: `/articles/${overrides.slug}.html`,
        ...overrides,
    };
}

describe("buildSeriesMap", () => {
    it("groups entries by series name, sorted by seriesOrder", () => {
        const index: ArticleIndexEntry[] = [
            entry({ title: "Part 2", slug: "part-2", series: "My Series", seriesOrder: 2 }),
            entry({ title: "Part 1", slug: "part-1", series: "My Series", seriesOrder: 1 }),
            entry({ title: "Standalone", slug: "standalone" }),
        ];
        const map = buildSeriesMap(index);

        assert.equal(map.size, 1);
        const series = map.get("My Series");
        assert.ok(series);
        assert.equal(series.length, 2);
        assert.equal(series[0].title, "Part 1");
        assert.equal(series[1].title, "Part 2");
    });

    it("returns empty map when no entries have series", () => {
        const index: ArticleIndexEntry[] = [
            entry({ title: "A", slug: "a" }),
            entry({ title: "B", slug: "b" }),
        ];
        const map = buildSeriesMap(index);
        assert.equal(map.size, 0);
    });

    it("handles multiple series", () => {
        const index: ArticleIndexEntry[] = [
            entry({ title: "A1", slug: "a1", series: "Series A", seriesOrder: 1 }),
            entry({ title: "B1", slug: "b1", series: "Series B", seriesOrder: 1 }),
            entry({ title: "A2", slug: "a2", series: "Series A", seriesOrder: 2 }),
        ];
        const map = buildSeriesMap(index);
        assert.equal(map.size, 2);
        assert.equal(map.get("Series A")?.length, 2);
        assert.equal(map.get("Series B")?.length, 1);
    });
});

describe("resolveSeriesInfo", () => {
    it("returns undefined when seriesName is undefined", () => {
        const map = new Map();
        assert.equal(resolveSeriesInfo(undefined, undefined, map), undefined);
    });

    it("returns undefined when series has no entries in map", () => {
        const map = new Map();
        assert.equal(resolveSeriesInfo("Unknown", 1, map), undefined);
    });

    it("returns series info with correct current order", () => {
        const index: ArticleIndexEntry[] = [
            entry({ title: "Part 1", slug: "p1", series: "S", seriesOrder: 1 }),
            entry({ title: "Part 2", slug: "p2", series: "S", seriesOrder: 2 }),
            entry({ title: "Part 3", slug: "p3", series: "S", seriesOrder: 3 }),
        ];
        const map = buildSeriesMap(index);
        const info = resolveSeriesInfo("S", 2, map);

        assert.ok(info);
        assert.equal(info.name, "S");
        assert.equal(info.entries.length, 3);
        assert.equal(info.currentOrder, 2);
    });
});
