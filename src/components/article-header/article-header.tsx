import styles from "./article-header.module.css";

function formatDate(value?: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

function safeISODate(value?: string): string {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().slice(0, 10);
}

export function getArticleTitleTransitionName(
    slugOrPath?: string,
): string | undefined {
    if (!slugOrPath) return undefined;

    const slug = slugOrPath
        .replace(/^\/articles\//, "")
        .replace(/\.html$/, "")
        .trim();

    const normalizedSlug = slug
        .replace(/[^a-z0-9_-]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    if (!normalizedSlug) return undefined;

    return `article-title-${normalizedSlug}`;
}

export function ArticleHeader({
    title,
    description,
    section,
    kickerType,
    published,
    revised,
    words,
    readingTime,
    note,
    titleTransitionName,
    seriesName,
}: {
    title?: string;
    description?: string;
    section?: string;
    kickerType?: string;
    published?: string;
    revised?: string;
    words?: number | string;
    readingTime?: string;
    note?: string;
    titleTransitionName?: string;
    seriesName?: string;
}) {
    const publishedIso = safeISODate(published);
    const revisedIso = safeISODate(revised);
    const revisedDate = formatDate(revised);
    const publishedDate = formatDate(published);
    const kickerSection = seriesName || section || "Articles";
    const lengthLabel = [readingTime, words ? `${String(words)} words` : ""]
        .filter(Boolean)
        .join(" · ");

    return (
        <header className={`section header ${styles.root}`}>
            <p className="header__eyebrow label">
                <span>{kickerSection}</span>
                <span>{kickerType || "Article"}</span>
            </p>
            <h1
                className="title heading-xl"
                style={
                    titleTransitionName
                        ? { viewTransitionName: titleTransitionName }
                        : undefined
                }
            >
                {title || ""}
            </h1>
            <div className="header__rule" aria-hidden="true"></div>
            <div className="header__meta">
                {publishedDate && (
                    <p className={styles.byline}>
                        <span className="label">Published</span>
                        <strong className="body-sm">
                            <time dateTime={publishedIso}>{publishedDate}</time>
                        </strong>
                    </p>
                )}
                {revisedDate && (
                    <p className={styles.byline}>
                        <span className="label">Revised</span>
                        <strong className="body-sm">
                            <time dateTime={revisedIso}>{revisedDate}</time>
                        </strong>
                    </p>
                )}
                {lengthLabel && (
                    <p className={styles.byline}>
                        <span className="label">Length</span>
                        <strong className="body-sm">{lengthLabel}</strong>
                    </p>
                )}
                {description && (
                    <p className="lede">
                        <span className="body-lg">{description}</span>
                    </p>
                )}
            </div>
            {note && <p className={`${styles.note} caption`}>{note}</p>}
        </header>
    );
}
