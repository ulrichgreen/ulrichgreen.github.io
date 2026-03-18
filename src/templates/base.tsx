import { useRenderContext } from "../context/render-context.tsx";
import { SiteHeader } from "../components/site-header/site-header.tsx";
import { SiteFooter } from "../components/site-footer/site-footer.tsx";
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
    seriesName,
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
                seriesName={seriesName}
            />
            <body>
                <div id="progress" aria-hidden="true"></div>
                <a className="skip-link" href="#main-content">
                    <span className="body-sm">Skip to content</span>
                </a>
                <SiteHeader />
                <main id="main-content" className={mainClassName}>
                    {children}
                    <SiteFooter />
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
