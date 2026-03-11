import { getArticleTitleTransitionName } from "./article-header.tsx";
import { useRenderContext } from "../build/render-context.tsx";
import type { WritingIndexEntry } from "../types/content.ts";

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

export function ArticleList({ items }: { items?: WritingIndexEntry[] }) {
    const { writingIndex } = useRenderContext();
    const entries = items || writingIndex;

    return (
        <ul className="writing-list">
            {entries.map((entry) => {
                const isoDate = new Date(entry.published)
                    .toISOString()
                    .slice(0, 10);
                const titleTransitionName = getArticleTitleTransitionName(
                    entry.slug,
                );

                return (
                    <li key={entry.slug}>
                        <a
                            href={entry.href}
                            style={
                                titleTransitionName
                                    ? {
                                          viewTransitionName:
                                              titleTransitionName,
                                      }
                                    : undefined
                            }
                        >
                            {entry.title}
                        </a>
                        <time dateTime={isoDate}>
                            {formatDate(entry.published)}
                        </time>
                    </li>
                );
            })}
        </ul>
    );
}
