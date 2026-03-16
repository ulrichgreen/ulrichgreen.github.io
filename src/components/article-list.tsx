import { getArticleTitleTransitionName } from "./article-header.tsx";
import { useRenderContext } from "../context/render-context.tsx";
import type { ArticleIndexEntry } from "../types/content.ts";

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

function groupBySeries(entries: ArticleIndexEntry[]): {
    standalone: ArticleIndexEntry[];
    series: Map<string, ArticleIndexEntry[]>;
    seriesOrder: string[];
} {
    const standalone: ArticleIndexEntry[] = [];
    const series = new Map<string, ArticleIndexEntry[]>();
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

function EntryItem({ entry }: { entry: ArticleIndexEntry }) {
    const isoDate = new Date(entry.published).toISOString().slice(0, 10);
    const titleTransitionName = getArticleTitleTransitionName(entry.slug);

    return (
        <li className="article-list__item">
            <a
                className="article-list__link"
                href={entry.href}
                style={
                    titleTransitionName
                        ? { viewTransitionName: titleTransitionName }
                        : undefined
                }
            >
                {entry.title}
            </a>
            <time className="label" dateTime={isoDate}>{formatDate(entry.published)}</time>
        </li>
    );
}

export function ArticleList({ items }: { items?: ArticleIndexEntry[] }) {
    const { articleIndex } = useRenderContext();
    const entries = items || articleIndex;
    const { standalone, series, seriesOrder } = groupBySeries(entries);

    return (
        <ul className="section article-list">
            {seriesOrder.map((seriesName) => {
                const group = series.get(seriesName) ?? [];
                return [
                    <li
                        key={`series-${seriesName}`}
                        className="article-list__series-label label"
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
