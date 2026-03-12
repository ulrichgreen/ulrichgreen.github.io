import { useRenderContext } from "../build/render-context.tsx";
import { PageHeader } from "../components/page-header.tsx";
import { SiteHead } from "../components/site-head.tsx";
import type { BaseLayoutProps } from "../types/content.ts";

const speculationRules = JSON.stringify({
    prerender: [{ where: { href_matches: "/*" }, eagerness: "moderate" }],
});

function IslandsScript() {
    const { hasIslands, assetManifest } = useRenderContext();
    if (!hasIslands()) return null;
    return <script src={`/${assetManifest["islands.js"]}`} defer />;
}

export default function BaseLayout({
    title,
    description,
    section = "",
    pagePath,
    published,
    revised,
    mainClassName = "page",
    children,
}: BaseLayoutProps) {
    const { assetManifest } = useRenderContext();

    return (
        <html lang="en">
            <SiteHead
                title={title}
                description={description}
                pagePath={pagePath}
                published={published}
                revised={revised}
                cssHref={`/${assetManifest["style.css"]}`}
            />
            <body>
                <div id="progress" aria-hidden="true"></div>
                <a className="skip-link" href="#main-content">
                    Skip to content
                </a>
                <PageHeader section={section} title={title} />
                <main id="main-content" className={mainClassName}>
                    {children}
                </main>
                <script src={`/${assetManifest["site.js"]}`} defer></script>
                <IslandsScript />
                <script
                    type="speculationrules"
                    dangerouslySetInnerHTML={{ __html: speculationRules }}
                />
            </body>
        </html>
    );
}
