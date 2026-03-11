import { useRenderContext } from "../build/render-context.tsx";
import { PageHeader } from "../components/page-header.tsx";
import { SiteHead } from "../components/site-head.tsx";
import type { BaseLayoutProps } from "../types/content.ts";

const speculationRules = JSON.stringify({
    prerender: [{ where: { href_matches: "/*" }, eagerness: "moderate" }],
});

export default function BaseLayout({
    title,
    description,
    section = "",
    pagePath,
    published,
    revised,
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
                <a className="skip-link" href="#main-content">
                    Skip to content
                </a>
                <PageHeader section={section} title={title} />
                <main id="main-content" className="page">
                    {children}
                </main>
                <script src={`/${assetManifest["site.js"]}`} defer></script>
                <script src={`/${assetManifest["islands.js"]}`} defer></script>
                <script
                    type="speculationrules"
                    dangerouslySetInnerHTML={{ __html: speculationRules }}
                />
            </body>
        </html>
    );
}
