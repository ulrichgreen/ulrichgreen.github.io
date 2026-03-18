import type { Revision } from "../../types/content.ts";
import styles from "./revision-history.module.css";

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
        <aside
            className={`section ${styles.root}`}
            aria-label="Revision history"
        >
            <p className={`${styles.heading} label`}>Revisions</p>
            <ol className={styles.list}>
                {revisions.map((revision) => (
                    <li key={revision.date} className={styles.entry}>
                        <time
                            className="label"
                            dateTime={safeISODate(revision.date)}
                        >
                            {formatDate(revision.date)}
                        </time>
                        <p className={`${styles.note} caption`}>
                            {revision.note}
                        </p>
                    </li>
                ))}
            </ol>
        </aside>
    );
}
