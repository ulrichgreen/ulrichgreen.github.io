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
        .replace(/^\/writing\//, "")
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
}) {
    const publishedIso = safeISODate(published);
    const revisedIso = safeISODate(revised);
    const revisedDate = formatDate(revised);
    const publishedDate = formatDate(published);
    const kickerSection = section || "Writing";
    const lengthLabel = [readingTime, words ? `${String(words)} words` : ""]
        .filter(Boolean)
        .join(" · ");

    return (
        <header className="article-header">
            <p className="article-header__kicker">
                <span>{kickerSection}</span>
                <span>{kickerType || "Essay"}</span>
            </p>
            <h1
                style={
                    titleTransitionName
                        ? { viewTransitionName: titleTransitionName }
                        : undefined
                }
            >
                {title || ""}
            </h1>
            <div className="article-header__rule" aria-hidden="true"></div>
            <div className="article-meta">
                {publishedDate && (
                    <p className="article-header__byline">
                        Published
                        <strong>
                            <time dateTime={publishedIso}>{publishedDate}</time>
                        </strong>
                    </p>
                )}
                {revisedDate && (
                    <p className="article-header__byline revised">
                        Revised
                        <strong>
                            <time dateTime={revisedIso}>{revisedDate}</time>
                        </strong>
                    </p>
                )}
                {lengthLabel && (
                    <p className="article-header__byline">
                        Length
                        <strong>{lengthLabel}</strong>
                    </p>
                )}
                {description && (
                    <p className="article-header__abstract">{description}</p>
                )}
            </div>
            {note && <p className="author-note">{note}</p>}
        </header>
    );
}
