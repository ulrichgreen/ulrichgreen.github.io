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
            <link rel="stylesheet" href="/style.css" />
        </head>
    );
}
