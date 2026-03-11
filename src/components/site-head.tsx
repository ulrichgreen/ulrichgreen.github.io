const SITE_URL = "https://ulrich.green";

export function SiteHead({
    title,
    description,
    pagePath,
}: {
    title?: string;
    description?: string;
    pagePath?: string;
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
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            <meta property="og:title" content={title || ""} />
            <meta property="og:description" content={description || ""} />
            <meta property="og:type" content={ogType} />
            {canonicalUrl && (
                <meta property="og:url" content={canonicalUrl} />
            )}
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
            <link rel="stylesheet" href="/style.css" />
        </head>
    );
}
