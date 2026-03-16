import type { ReactNode } from "preact/compat";
import ArticleLayout from "../../templates/article.tsx";
import BaseLayout from "../../templates/base.tsx";
import type { PageMeta, SeriesInfo, ArticlePageMeta } from "../../types/content.ts";

export function renderLayout(meta: PageMeta, children: ReactNode, seriesInfo?: SeriesInfo): ReactNode {
    if (meta.layout === "article") {
        const articleMeta = meta as ArticlePageMeta;
        return (
            <ArticleLayout {...articleMeta} seriesInfo={seriesInfo}>{children}</ArticleLayout>
        );
    }
    return (
        <BaseLayout
            title={meta.title}
            description={meta.description}
            section={meta.section}
            pagePath={meta.pagePath}
        >
            {children}
        </BaseLayout>
    );
}
