const SITE_URL = "https://ulrich.green";
const OG_IMAGE_URL = `${SITE_URL}/og-image.svg`;
const LIGHT_THEME_COLOR = "#f8f7f5";
const DARK_THEME_COLOR = "#1a1917";

function safeISODate(value: string): string | undefined {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString().slice(0, 10);
}

export function SiteHead({
    title,
    description,
    pagePath,
    published,
    revised,
    cssHref,
}: {
    title?: string;
    description?: string;
    pagePath?: string;
    published?: string;
    revised?: string;
    cssHref?: string;
}) {
    const canonicalUrl = pagePath ? `${SITE_URL}${pagePath}` : undefined;
    const ogType = pagePath?.startsWith("/writing/") ? "article" : "website";

    return (
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <title>{title || ""}</title>
            <meta name="description" content={description || ""} />
            <meta
                name="theme-color"
                media="(prefers-color-scheme: light)"
                content={LIGHT_THEME_COLOR}
            />
            <meta
                name="theme-color"
                media="(prefers-color-scheme: dark)"
                content={DARK_THEME_COLOR}
            />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            <meta property="og:title" content={title || ""} />
            <meta property="og:description" content={description || ""} />
            <meta property="og:type" content={ogType} />
            {canonicalUrl && (
                <meta property="og:url" content={canonicalUrl} />
            )}
            <meta property="og:image" content={OG_IMAGE_URL} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary" />
            <meta
                name="view-transition"
                content="same-origin"
            />
            <link
                rel="icon"
                href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%232a3f5f'/><text x='50' y='72' font-size='60' text-anchor='middle' fill='%23f8f7f5' font-family='system-ui'>U</text></svg>"
            />
            <link
                rel="preload"
                href="/fonts/JetBrainsMono-Regular.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={cssHref || "/style.css"} />
            <link rel="alternate" type="application/atom+xml" title="Ulrich Green" href="/feed.xml" />
            {pagePath?.startsWith("/writing/") && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Article",
                            headline: title || "",
                            ...(description ? { description } : {}),
                            ...(published && safeISODate(published) ? { datePublished: safeISODate(published) } : {}),
                            ...(revised && safeISODate(revised) ? { dateModified: safeISODate(revised) } : {}),
                            author: {
                                "@type": "Person",
                                name: "Ulrich Green",
                                url: "https://ulrich.green",
                            },
                        }),
                    }}
                />
            )}
        </head>
    );
}
