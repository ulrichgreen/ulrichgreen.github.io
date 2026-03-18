import type { ArticleIndexEntry, SeriesInfo, SeriesEntry } from "../../types/content.ts";

export function buildSeriesMap(
    articleIndex: ArticleIndexEntry[],
): Map<string, SeriesEntry[]> {
    const seriesMap = new Map<string, SeriesEntry[]>();
    const ordersBySeries = new Map<string, Map<number, ArticleIndexEntry>>();

    for (const entry of articleIndex) {
        if (!entry.series) continue;

        if (entry.seriesOrder !== undefined) {
            const seriesOrders =
                ordersBySeries.get(entry.series) ?? new Map<number, ArticleIndexEntry>();
            const conflictingEntry = seriesOrders.get(entry.seriesOrder);
            if (conflictingEntry) {
                throw new Error(
                    [
                        `Series "${entry.series}" has conflicting seriesOrder ${entry.seriesOrder}.`,
                        conflictingEntry.sourcePath,
                        entry.sourcePath,
                    ].join(" "),
                );
            }
            seriesOrders.set(entry.seriesOrder, entry);
            ordersBySeries.set(entry.series, seriesOrders);
        }

        const seriesEntry: SeriesEntry = {
            title: entry.title,
            slug: entry.slug,
            href: entry.href,
            order: entry.seriesOrder ?? 0,
            published: entry.published,
        };

        const existing = seriesMap.get(entry.series);
        if (existing) {
            existing.push(seriesEntry);
        } else {
            seriesMap.set(entry.series, [seriesEntry]);
        }
    }

    for (const entries of seriesMap.values()) {
        entries.sort((a, b) => a.order - b.order);
    }

    return seriesMap;
}

export function resolveSeriesInfo(
    seriesName: string | undefined,
    seriesOrder: number | undefined,
    seriesMap: Map<string, SeriesEntry[]>,
): SeriesInfo | undefined {
    if (!seriesName) return undefined;

    const entries = seriesMap.get(seriesName);
    if (!entries || entries.length === 0) return undefined;

    return {
        name: seriesName,
        entries,
        currentOrder: seriesOrder ?? 0,
    };
}
