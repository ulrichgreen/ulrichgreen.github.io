import type { SeriesInfo } from "../../types/content.ts";
import styles from "./series-nav.module.css";

export function SeriesNav({ seriesInfo }: { seriesInfo: SeriesInfo }) {
    const { name, entries, currentOrder } = seriesInfo;
    const currentIndex = entries.findIndex((e) => e.order === currentOrder);
    const prev = currentIndex > 0 ? entries[currentIndex - 1] : undefined;
    const next =
        currentIndex < entries.length - 1
            ? entries[currentIndex + 1]
            : undefined;
    const total = entries.length;
    const current = currentIndex + 1;

    return (
        <nav
            className={`section semi-bleed card ${styles.root}`}
            aria-label={`${name} series navigation`}
        >
            <div className={styles.header}>
                <p className="label">Series</p>
                <p className={`${styles.seriesTitle} heading-sm`}>{name}</p>
                <p className={`${styles.progress} label`}>
                    Part {current} of {total}
                </p>
            </div>
            <div
                className={styles.track}
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-label={`Part ${current} of ${total}`}
            >
                <div
                    className={styles.fill}
                    style={{ width: `${(current / total) * 100}%` }}
                />
            </div>
            <ol className={styles.list}>
                {entries.map((entry, index) => {
                    const isCurrent = entry.order === currentOrder;
                    return (
                        <li
                            key={entry.slug}
                            className={
                                isCurrent
                                    ? `${styles.item} ${styles.itemCurrent}`
                                    : styles.item
                            }
                        >
                            <span className={`${styles.ordinal} label`}>
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            {isCurrent ? (
                                <span
                                    className={`${styles.link} ${styles.linkCurrent} body-sm`}
                                    aria-current="page"
                                >
                                    {entry.title}
                                </span>
                            ) : (
                                <a
                                    className={`${styles.link} body-sm`}
                                    href={entry.href}
                                >
                                    {entry.title}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ol>
            {(prev || next) && (
                <div className={styles.arrows}>
                    {prev ? (
                        <a className={`${styles.prev} label`} href={prev.href}>
                            ← {prev.title}
                        </a>
                    ) : (
                        <span />
                    )}
                    {next ? (
                        <a className={`${styles.next} label`} href={next.href}>
                            {next.title} →
                        </a>
                    ) : (
                        <span />
                    )}
                </div>
            )}
        </nav>
    );
}
