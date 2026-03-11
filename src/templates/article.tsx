import {
    ArticleHeader,
    getArticleTitleTransitionName,
} from "../components/article-header.tsx";
import BaseLayout from "./base.tsx";
import type { ArticleLayoutProps } from "../types/content.ts";

export default function ArticleLayout({
    title,
    description,
    section,
    pagePath,
    published,
    revised,
    words,
    note,
    children,
}: ArticleLayoutProps) {
    return (
        <BaseLayout
            title={title}
            description={description}
            section={section}
            pagePath={pagePath}
        >
            <article>
                <ArticleHeader
                    title={title}
                    published={published}
                    revised={revised}
                    words={words}
                    note={note}
                    titleTransitionName={getArticleTitleTransitionName(pagePath)}
                />
                <div className="article-body">{children}</div>
                <footer className="article-footer">
                    <a href="/index.html">← All writing</a>
                </footer>
            </article>
        </BaseLayout>
    );
}
