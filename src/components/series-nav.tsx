import type { SeriesInfo } from "../types/content.ts";

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
        <nav className="section semi-bleed card series-nav" aria-label={`${name} series navigation`}>
            <div className="series-nav__header">
                <p className="series-nav__label label">Series</p>
                <p className="series-nav__title title">{name}</p>
                <p className="series-nav__progress label">
                    Part {current} of {total}
                </p>
            </div>
            <div
                className="series-nav__track"
                role="progressbar"
                aria-valuenow={current}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-label={`Part ${current} of ${total}`}
            >
                <div
                    className="series-nav__fill"
                    style={{ width: `${(current / total) * 100}%` }}
                />
            </div>
            <ol className="series-nav__list">
                {entries.map((entry, index) => {
                    const isCurrent = entry.order === currentOrder;
                    return (
                        <li
                            key={entry.slug}
                            className={
                                isCurrent
                                    ? "series-nav__item series-nav__item--current"
                                    : "series-nav__item"
                            }
                        >
                            <span className="series-nav__ordinal label">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            {isCurrent ? (
                                <span
                                    className="series-nav__link series-nav__link--current"
                                    aria-current="page"
                                >
                                    {entry.title}
                                </span>
                            ) : (
                                <a className="series-nav__link" href={entry.href}>
                                    {entry.title}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ol>
            {(prev || next) && (
                <div className="series-nav__arrows">
                    {prev ? (
                        <a className="series-nav__prev label" href={prev.href}>
                            ← {prev.title}
                        </a>
                    ) : (
                        <span />
                    )}
                    {next ? (
                        <a className="series-nav__next label" href={next.href}>
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
