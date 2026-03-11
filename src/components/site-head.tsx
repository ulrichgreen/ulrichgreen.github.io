export function SiteHead({
    title,
    description,
}: {
    title?: string;
    description?: string;
}) {
    return (
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <title>{title || ""}</title>
            <meta name="description" content={description || ""} />
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
