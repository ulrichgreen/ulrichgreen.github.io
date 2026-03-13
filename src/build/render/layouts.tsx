import type { ReactNode } from "react";
import ArticleLayout from "../../templates/article.tsx";
import BaseLayout from "../../templates/base.tsx";
import type { PageMeta, SeriesInfo } from "../../types/content.ts";

type LayoutRenderer = (meta: PageMeta, children: ReactNode, seriesInfo?: SeriesInfo) => ReactNode;

const layoutRegistry = {
    article: (meta, children, seriesInfo) => (
        <ArticleLayout {...meta} seriesInfo={seriesInfo}>{children}</ArticleLayout>
    ),
    base: (meta, children) => (
        <BaseLayout
            title={meta.title}
            description={meta.description}
            section={meta.section}
            pagePath={meta.pagePath}
        >
            {children}
        </BaseLayout>
    ),
} satisfies Record<PageMeta["layout"], LayoutRenderer>;

export function renderLayout(meta: PageMeta, children: ReactNode, seriesInfo?: SeriesInfo): ReactNode {
    return layoutRegistry[meta.layout](meta, children, seriesInfo);
}
