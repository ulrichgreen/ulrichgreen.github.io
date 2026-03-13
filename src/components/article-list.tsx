import { getArticleTitleTransitionName } from "./article-header.tsx";
import { useRenderContext } from "../context/render-context.tsx";
import type { WritingIndexEntry } from "../types/content.ts";

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

function groupBySeries(entries: WritingIndexEntry[]): {
    standalone: WritingIndexEntry[];
    series: Map<string, WritingIndexEntry[]>;
    seriesOrder: string[];
} {
    const standalone: WritingIndexEntry[] = [];
    const series = new Map<string, WritingIndexEntry[]>();
    const seriesOrder: string[] = [];

    for (const entry of entries) {
        if (entry.series) {
            const existing = series.get(entry.series);
            if (existing) {
                existing.push(entry);
            } else {
                series.set(entry.series, [entry]);
                seriesOrder.push(entry.series);
            }
        } else {
            standalone.push(entry);
        }
    }

    for (const group of series.values()) {
        group.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
    }

    return { standalone, series, seriesOrder };
}

function EntryItem({ entry }: { entry: WritingIndexEntry }) {
    const isoDate = new Date(entry.published).toISOString().slice(0, 10);
    const titleTransitionName = getArticleTitleTransitionName(entry.slug);

    return (
        <li>
            <a
                href={entry.href}
                style={
                    titleTransitionName
                        ? { viewTransitionName: titleTransitionName }
                        : undefined
                }
            >
                {entry.title}
            </a>
            <time dateTime={isoDate}>{formatDate(entry.published)}</time>
        </li>
    );
}

export function ArticleList({ items }: { items?: WritingIndexEntry[] }) {
    const { writingIndex } = useRenderContext();
    const entries = items || writingIndex;
    const { standalone, series, seriesOrder } = groupBySeries(entries);

    return (
        <ul className="writing-list">
            {seriesOrder.map((seriesName) => {
                const group = series.get(seriesName) ?? [];
                return [
                    <li
                        key={`series-${seriesName}`}
                        className="writing-list__series-label"
                    >
                        Series · {seriesName}
                    </li>,
                    ...group.map((entry) => (
                        <EntryItem key={entry.slug} entry={entry} />
                    )),
                ];
            })}
            {standalone.map((entry) => (
                <EntryItem key={entry.slug} entry={entry} />
            ))}
        </ul>
    );
}
