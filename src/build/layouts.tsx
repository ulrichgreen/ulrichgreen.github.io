import type { ReactNode } from "react";
import ArticleLayout from "../templates/article.tsx";
import BaseLayout from "../templates/base.tsx";
import type { PageMeta } from "../types/content.ts";

type LayoutRenderer = (meta: PageMeta, children: ReactNode) => ReactNode;

const layoutRegistry = {
    article: (meta, children) => (
        <ArticleLayout {...meta}>{children}</ArticleLayout>
    ),
    base: (meta, children) => (
        <BaseLayout
            title={meta.title}
            description={meta.description}
            section={meta.section}
        >
            {children}
        </BaseLayout>
    ),
} satisfies Record<PageMeta["layout"], LayoutRenderer>;

export function renderLayout(meta: PageMeta, children: ReactNode): ReactNode {
    return layoutRegistry[meta.layout](meta, children);
}
