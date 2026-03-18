import type { Revision } from "../types/content.ts";

function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

function safeISODate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

export function RevisionHistory({ revisions }: { revisions: Revision[] }) {
    return (
        <aside className="section revision-history" aria-label="Revision history">
            <p className="revision-history__heading label">Revisions</p>
            <ol className="revision-history__list">
                {revisions.map((revision) => (
                    <li key={revision.date} className="revision-history__entry">
                        <time className="label" dateTime={safeISODate(revision.date)}>
                            {formatDate(revision.date)}
                        </time>
                        <p className="revision-history__note">{revision.note}</p>
                    </li>
                ))}
            </ol>
        </aside>
    );
}
